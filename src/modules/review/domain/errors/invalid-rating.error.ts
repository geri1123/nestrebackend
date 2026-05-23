export class InvalidRatingError extends Error {
  constructor(min: number, max: number) {
    super(`Rating must be an integer between ${min} and ${max}`);
    this.name = 'InvalidRatingError';
  }
}
