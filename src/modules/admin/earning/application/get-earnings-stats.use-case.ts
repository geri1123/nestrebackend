import { Injectable, Inject } from "@nestjs/common";
import { DailyBreakdown, EARNINGS_REPOSITORY, EarningsPeriod, IEarningsRepository, MonthlyBreakdown } from "../../../wallet/domain/repositories/earning.interface.repository";


export interface EarningsStatsResponse {
  today: EarningsPeriod;
  thisWeek: EarningsPeriod;
  thisMonth: EarningsPeriod;
  thisYear: EarningsPeriod;
  allTime: EarningsPeriod;
  dailyBreakdown: DailyBreakdown[];
  monthlyBreakdown: MonthlyBreakdown[];
}

@Injectable()
export class GetEarningsStatsUseCase {
  constructor(
    @Inject(EARNINGS_REPOSITORY)
    private readonly earningsRepository: IEarningsRepository,
  ) {}

  async execute(): Promise<EarningsStatsResponse> {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [today, thisWeek, thisMonth, thisYear, allTime, dailyBreakdown, monthlyBreakdown] =
      await Promise.all([
        this.earningsRepository.getEarningsForPeriod(startOfToday, now),
        this.earningsRepository.getEarningsForPeriod(startOfWeek, now),
        this.earningsRepository.getEarningsForPeriod(startOfMonth, now),
        this.earningsRepository.getEarningsForPeriod(startOfYear, now),
        this.earningsRepository.getEarningsForPeriod(),
        this.earningsRepository.getDailyBreakdown(30),
        this.earningsRepository.getMonthlyBreakdown(12),
      ]);

    return {
      today,
      thisWeek,
      thisMonth,
      thisYear,
      allTime,
      dailyBreakdown,
      monthlyBreakdown,
    };
  }
}