import { advertisement_type } from "@prisma/client";

export class Advertisement {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly userId: number,
    public readonly adType: advertisement_type,
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly transactionId: string | null
  ) {}
}