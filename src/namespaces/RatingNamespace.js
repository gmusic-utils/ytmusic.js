import GMusicNamespace from '../GMusicNamespace';
import { ratingSelectors } from '../constants/selectors';
import click from '../utils/click';

export default class RatingNamespace extends GMusicNamespace {
  constructor(...args) {
    super(...args);

    this._mapSelectors(ratingSelectors);
    this._hookEvents();

    this.addMethods(['getRating', 'toggleThumbsUp', 'toggleThumbsDown', 'setRating', 'resetRating']);
  }

  getRating() {
    const container = document.querySelector(ratingSelectors.ratingContainer);
    switch (container.getAttribute('like-status')) {
      case 'DISLIKE':
        return '1';
      case 'LIKE':
        return '5';
      default:
        return '0';
    }
  }

  toggleThumbsUp() {
    click(this._thumbsUpEl);
  }

  toggleThumbsDown() {
    click(this._thumbsDownEl);
  }

  setRating(rating) {
    const currentRating = this.getRating();
    if (`${rating}` === currentRating) return;
    if (`${rating}` === '1') {
      this.toggleThumbsDown();
    } else if (`${rating}` === '5') {
      this.toggleThumbsUp();
    } else {
      if (currentRating === '1') {
        this.toggleThumbsDown();
      } else {
        this.toggleThumbsUp();
      }
    }
  }

  resetRating() {
    this.setRating('0');
  }

  _hookEvents() {
    let lastRating;

    // Change Rating Event
    new MutationObserver((mutations) => {
      const ratingsTouched = mutations.some((m) =>
        // Determine if our ratings were touched
        m.target.dataset && m.target.dataset.rating && m.target.hasAttribute('aria-label')
      );

      if (!ratingsTouched) return;

      const newRating = this.getRating();
      if (lastRating !== newRating) {
        this.emit('change:rating', newRating);
        lastRating = newRating;
      }
    }).observe(document.querySelector(ratingSelectors.ratingContainer), {
      attributes: true,
      subtree: true,
    });
  }
}
