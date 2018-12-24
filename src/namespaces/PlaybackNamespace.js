import assert from 'assert';

import GMusicNamespace from '../GMusicNamespace';
import Track from '../structs/Track';
import { controlsSelectors, playbackSelectors, nowPlayingSelectors } from '../constants/selectors';
import click from '../utils/click';

export default class PlaybackNamespace extends GMusicNamespace {
  static ENUMS = {
    PlaybackStatus: {
      STOPPED: 0,
      PAUSED: 1,
      PLAYING: 2,
    },
    ShuffleStatus: {
      ALL_SHUFFLE: 'ALL_SHUFFLE',
      NO_SHUFFLE: 'NO_SHUFFLE',
    },
    RepeatStatus: {
      LIST_REPEAT: 'LIST_REPEAT',
      NO_REPEAT: 'NO_REPEAT',
      SINGLE_REPEAT: 'SINGLE_REPEAT',
    },
  };

  constructor(...args) {
    super(...args);

    this._mapSelectors(playbackSelectors);
    this._hookEvents();

    this.addMethods([
      'getCurrentTime', 'setCurrentTime', 'getTotalTime', 'getCurrentTrack', 'isPlaying', 'getPlaybackState', 'playPause',
      'rewind', 'forward', 'getShuffle', 'setShuffle', 'toggleShuffle', 'getRepeat', 'setRepeat', 'toggleRepeat', 'toggleVisualization',
      'isPodcast', 'forwardThirty', 'rewindTen', 'startFeelingLucky',
    ]);
  }

  _textContent(el, defaultText) {
    return el ? el.textContent || defaultText : defaultText;
  }

  getCurrentTime() {
    return Math.round(this._videoEl.currentTime * 1000);
  }

  setCurrentTime(milliseconds) {
    this._videoEl.currentTime = milliseconds / 1000;
  }

  getTotalTime() {
    return Math.round(document.querySelector(nowPlayingSelectors.playerBar).__data__.durationSeconds_ * 1000);
  }

  getCurrentTrack() {
    const playerBar = document.querySelector(nowPlayingSelectors.playerBar);
    const track = new Track({
      id: null,
      title: playerBar.__data__.playerPageWatchMetadata_.title.runs[0].text || 'Unknown Title',
      artist: playerBar.__data__.playerPageWatchMetadata_.byline.runs[0].text || 'Unknown Artist',
      album: playerBar.__data__.playerPageWatchMetadata_.albumName.runs[0].text || 'Unknown Album',
      albumArt: (document.querySelector(nowPlayingSelectors.albumArt) || { src: null }).src,
      duration: this.getTotalTime(),
    });

    // DEV: The art may be a protocol-relative URL, so normalize it to HTTPS
    if (track.albumArt && track.albumArt.slice(0, 2) === '//') {
      track.albumArt = `https:${track.albumArt}`;
    }
    return track;
  }

  isPlaying() {
    return !this._videoEl.paused;
  }

  getPlaybackState() {
    if (this._videoEl.paused) {
      return PlaybackNamespace.ENUMS.PlaybackStatus.PAUSED;
    } else {
      return PlaybackNamespace.ENUMS.PlaybackStatus.PLAYING;
    }
  }

  playPause() {
    click(document.querySelector(controlsSelectors.playPause));
  }

  forward() {
    click(document.querySelector(controlsSelectors.forward));
  }

  rewind() {
    click(document.querySelector(controlsSelectors.rewind));
  }

  getShuffle() {
    return PlaybackNamespace.ENUMS.ShuffleStatus.NO_SHUFFLE;
  }

  setShuffle(mode) {
    assert(Object.keys(PlaybackNamespace.ENUMS.ShuffleStatus).indexOf(mode) !== -1,
      `Expected shuffle mode "${mode}" to be inside ${JSON.stringify(Object.keys(PlaybackNamespace.ENUMS.ShuffleStatus))} but it wasn't`);
    if (mode === this.getShuffle()) return;

    this.toggleShuffle();
  }

  toggleShuffle() {
    click(document.querySelector(controlsSelectors.shuffle));
  }

  getRepeat() {
    const bar = document.querySelector(nowPlayingSelectors.playerBar);
    const repeatMode = bar.getAttribute('repeat-mode_');

    if (repeatMode === 'ONE') {
      return PlaybackNamespace.ENUMS.RepeatStatus.SINGLE_REPEAT;
    } else if (repeatMode === 'ALL') {
      return PlaybackNamespace.ENUMS.RepeatStatus.LIST_REPEAT;
    }
    return PlaybackNamespace.ENUMS.RepeatStatus.NO_REPEAT;
  }

  setRepeat(mode) {
    assert(Object.keys(PlaybackNamespace.ENUMS.RepeatStatus).indexOf(mode) !== -1,
      `Expected repeat mode "${mode}" to be inside ${JSON.stringify(Object.keys(PlaybackNamespace.ENUMS.RepeatStatus))} but it wasn't`);

    const bar = document.querySelector(nowPlayingSelectors.playerBar);
    if (mode === PlaybackNamespace.ENUMS.RepeatStatus.SINGLE_REPEAT) {
      bar.setAttribute('repeat-mode_', 'ONE');
    } else if (mode === PlaybackNamespace.ENUMS.RepeatStatus.LIST_REPEAT) {
      bar.setAttribute('repeat-mode_', 'ALL');
    } else {
      bar.setAttribute('repeat-mode_', 'NONE');
    }
  }

  toggleRepeat() {
    click(document.querySelector(controlsSelectors.repeat));
  }

  isPodcast() {
    return false;
  }

  rewindTen() {
    // TODO: Implement?
  }

  forwardThirty() {
    // TODO: Implement?
  }

  toggleVisualization() {
    // TODO: Implement?
  }

  startFeelingLucky() {
    // TODO: Implement?
  }

  _hookEvents() {
    // Playback Time Event
    this._progressEl.addEventListener('value-changed', () => {
      this.emit('change:playback-time', {
        current: this.getCurrentTime(),
        total: this.getTotalTime(),
      });
    });

    // Change Shuffle Event
    let lastShuffle;
    new MutationObserver((mutations) => {
      const shuffleTouched = mutations.some((m) => m.target.dataset.id === 'shuffle');

      if (!shuffleTouched) return;

      const newShuffle = this.getShuffle();
      if (lastShuffle !== newShuffle) {
        lastShuffle = newShuffle;
        this.emit('change:shuffle', newShuffle);
      }
    }).observe(document.querySelector(controlsSelectors.shuffle), {
      attributes: true,
    });

    // Change Repeat Event
    let lastRepeat;
    new MutationObserver((mutations) => {
      const repeatTouched = mutations.some((m) => m.target.dataset.id === 'repeat');

      if (!repeatTouched) return;

      const newRepeat = this.getRepeat();
      if (lastRepeat !== newRepeat) {
        lastRepeat = newRepeat;
        this.emit('change:repeat', newRepeat);
      }
    }).observe(document.querySelector(controlsSelectors.repeat), {
      attributes: true,
    });

    // Play/Pause Event
    let lastMode;
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.target.classList.contains('play-pause-button')) {
          const currentMode = this.getPlaybackState();

          // If the mode has changed, then update it
          if (currentMode !== lastMode) {
            this.emit('change:playback', currentMode);
            lastMode = currentMode;
          }
        }
      });
    }).observe(document.querySelector(controlsSelectors.playPause), {
      attributes: true,
    });

    // Track Change Proxy Event Listener
    let lastByLineText = '';
    const proxyTarget = document.querySelector(nowPlayingSelectors.playerBar).__data__;
    const proxy = new Proxy(proxyTarget, {
      set: (obj, prop, value) => {
        // Try catch because any errors break YTM UI
        try {
          if (prop === 'displayedMetadata_' && value.bylineText && value.thumbnailUrl && value.title) {
            if (value.bylineText[0].runs[0].text !== lastByLineText) {
              const currentTrack = this.getCurrentTrack();
              this.emit('change:track', currentTrack);
              lastByLineText = value.bylineText[0].runs[0].text;
            }
          }
        } catch (e) { console.error(e); }
        obj[prop] = value;
      },
    });
    document.querySelector(nowPlayingSelectors.playerBar).__data__ = proxy;
  }
}
