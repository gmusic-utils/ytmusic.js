export const volumeSelectors = {
  volumeSlider: '.volume-slider',
};

export const playbackSelectors = {
  video: 'video.video-stream',
  progress: 'ytmusic-player-bar > paper-slider.ytmusic-player-bar',
};

export const podcastSelectors = {
  podcast: '.now-playing-actions',
};

export const nowPlayingSelectors = {
  playerBar: 'ytmusic-player-bar',
  albumArt: 'img.ytmusic-player-bar',
  albumName: '.byline a:nth-child(2)',
  artistName: '.byline a:nth-child(1)',
  nowPlayingContainer: '.middle-controls',
  infoWrapper: '.content-info-wrapper',
  title: '.title',
};

export const controlsSelectors = {
  forward: '.left-controls .next-button',
  playPause: '.left-controls .play-pause-button',
  repeat: '.right-controls .repeat',
  rewind: '.left-controls .previous-button',
  shuffle: '.right-controls .shuffle',
};

export const ratingSelectors = {
  ratingContainer: 'ytmusic-like-button-renderer',
  thumbs: 'paper-icon-button',
  thumbsUp: '.like',
  thumbsDown: '.dislike',
};
