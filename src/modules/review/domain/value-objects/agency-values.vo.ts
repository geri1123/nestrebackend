
export interface ReviewerSummaryVO {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImgUrl: string | null; // ← jo profileImg
}
export interface AgencyReviewItemVO {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewer: ReviewerSummaryVO;
}

export class AgencyReviewsVo {
  constructor(
    public readonly reviews: AgencyReviewItemVO[],
    public readonly totalCount: number,
    public readonly rawAverageRating: number | null, // ← raw nga DB
    public readonly limit: number,
    public readonly offset: number,
  ) {}

  /** Mesatarja e rrumbullakosur në një dhjetor për UI. */
  get averageRating(): number | null {
    if (this.rawAverageRating === null) return null;
    return Math.round(this.rawAverageRating * 10) / 10;
  }

  get totalPages(): number {
    return this.limit > 0 ? Math.ceil(this.totalCount / this.limit) : 0;
  }

  get hasMore(): boolean {
    return this.offset + this.reviews.length < this.totalCount;
  }
}