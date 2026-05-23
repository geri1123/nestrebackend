export class CannotReviewOwnAgencyError extends Error {
  constructor() {
    super('You cannot review an agency you belong to');
    this.name = 'CannotReviewOwnAgencyError';
  }
}
