export class ReviewAlreadyExistsError extends Error {
  constructor() {
    super('You have already reviewed this agency');
    this.name = 'ReviewAlreadyExistsError';
  }
}
