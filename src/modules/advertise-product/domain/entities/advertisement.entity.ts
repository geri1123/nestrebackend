
import { advertisementType } from "../types/advertisement.type";

export class Advertisement {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly userId: number,
    public readonly adType: advertisementType,
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly transactionId: string | null
  ) {}
}