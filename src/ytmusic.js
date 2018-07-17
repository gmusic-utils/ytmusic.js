import Emitter from 'events';

import { volumeSelectors, playbackSelectors, nowPlayingSelectors, controlsSelectors, ratingSelectors } from './constants/selectors';

import ExtrasNamespace from './namespaces/ExtrasNamespace';
import PlaybackNamespace from './namespaces/PlaybackNamespace';
import RatingNamespace from './namespaces/RatingNamespace';
import VolumeNamespace from './namespaces/VolumeNamespace';

const namespaces = {};

class YTMusic extends Emitter {
  static SELECTORS = { volumeSelectors, playbackSelectors, nowPlayingSelectors, controlsSelectors, ratingSelectors };

  constructor() {
    super();
    Object.keys(namespaces).forEach((namespaceName) => {
      const namespaceClasses = namespaces[namespaceName];
      namespaceClasses.forEach((NamespaceClass) => {
        const namespace = new NamespaceClass(this.emit.bind(this), this.on.bind(this));
        this[namespaceName] = Object.assign(this[namespaceName] || {}, namespace.getPrototype());
      });
    });
  }

  static addNamespace(namespaceName, namespaceClass) {
    namespaces[namespaceName] = namespaces[namespaceName] || [];
    namespaces[namespaceName].push(namespaceClass);
    Object.assign(YTMusic, namespaceClass.ENUMS || {});
  }
}

YTMusic.addNamespace('extras', ExtrasNamespace);
YTMusic.addNamespace('playback', PlaybackNamespace);
YTMusic.addNamespace('rating', RatingNamespace);
YTMusic.addNamespace('volume', VolumeNamespace);

export default YTMusic;
