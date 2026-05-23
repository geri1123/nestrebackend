export class NotReviewAuthorError extends Error {
  constructor() {
    super('You can only edit your own reviews');
    this.name = 'NotReviewAuthorError';
  }
}