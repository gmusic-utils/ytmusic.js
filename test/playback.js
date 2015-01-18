// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
describe('A Google Music instance playing music (via manual click)', function () {
  browserUtils.openMusic();
  browserMusicUtils.playAnything();
  browserMusicUtils.waitForPlaybackStart();

  describe('when paused via our API', function () {
    browserUtils.execute(function pauseViaApi () {
      window.MusicAPI.Playback.playPause();
    });
    browserMusicUtils.waitForPlaybackPause();

    it('is paused', function () {
      // Would not run if `browserMusicUtils.waitForPlaybackPause()` failed
    });

    describe('when played via our API', function () {
      browserUtils.execute(function pauseViaApi () {
        window.MusicAPI.Playback.playPause();
      });
      browserMusicUtils.waitForPlaybackStart();

      it('is playing', function () {
        // Would not run if `browserMusicUtils.waitForPlaybackPause()` failed
      });

      describe('playing the next track', function () {
        browserUtils.execute(function getCurrentTrack () {
          return document.getElementById('playerSongTitle').textContent;
        });
        before(function saveCurrentTrack () {
          this.track = this.result;
        });
        browserUtils.execute(function moveToNextTrack () {
          window.MusicAPI.Playback.forward();
        });
        browserUtils.execute(function getNewTrack () {
          return document.getElementById('playerSongTitle').textContent;
        });
        after(function cleanup () {
          delete this.track;
        });

        it('changes songs', function () {
          var newTrack = this.result;
          expect(newTrack).to.not.equal(this.track);
        });

        describe('playing the previous track', function () {
          browserUtils.execute(function moveToPreviousTrack () {
            window.MusicAPI.Playback.rewind();
          });
          browserUtils.execute(function getNewTrack () {
            return document.getElementById('playerSongTitle').textContent;
          });

          it('goes back to the original song', function () {
            var originalTrack = this.result;
            expect(originalTrack).to.equal(this.track);
          });
        });
      });
    });
  });
});

describe.only('A Google Music instance not playing music', function () {
  browserUtils.openMusic();
  browserUtils.execute(function getPlaybackNothing () {
    return window.MusicAPI.Playback.getPlaybackTime();
  });

  // Currently we return 0 but that isn't accurate. We should return 0.
  // TODO: Should we expect this as a proper use case?
  it.skip('has no time for playback', function () {
    expect(this.result).to.equal(null);
  });

  describe('playing music', function () {
    browserMusicUtils.playAnything();
    browserMusicUtils.waitForPlaybackStart();
    browserUtils.execute(function getPlaybackStart () {
      return window.MusicAPI.Playback.getPlaybackTime();
    });

    it('is within the 0 to 10 seconds of playback', function () {
      expect(this.result).to.be.at.least(0);
      expect(this.result).to.be.lessThan(10000);
    });

    describe.skip('when seeked to 50% of a track', function () {
      it('is within 50 to 60% of playback', function () {
        // Placeholder for linter
      });
    });
  });
});

describe.skip('A Google Music instance with shuffle and repeat off', function () {
  it('has shuffle off', function () {
    // Placeholder for linter
  });

  it('has repeat off', function () {
    // Placeholder for linter
  });

  describe('when we enable shuffle', function () {
    it('has shuffle on', function () {
      // Placeholder for linter
    });
  });

  describe('when we enable repeat', function () {
    it('has repeat on', function () {
      // Placeholder for linter
    });
  });
});
