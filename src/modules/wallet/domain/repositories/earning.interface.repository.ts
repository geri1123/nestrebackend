export interface EarningsPeriod {
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
}
 
export interface DailyBreakdown {
  date: string;
  amount: number;
  count: number;
}
 
export interface MonthlyBreakdown {
  month: string;
  amount: number;
  count: number;
}
 
export interface IEarningsRepository {
  getEarningsForPeriod(from?: Date, to?: Date): Promise<EarningsPeriod>;
  getDailyBreakdown(days: number): Promise<DailyBreakdown[]>;
  getMonthlyBreakdown(months: number): Promise<MonthlyBreakdown[]>;
}
 
export const EARNINGS_REPOSITORY = Symbol("IEarningsRepository");
