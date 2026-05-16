import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_REPO,
  type IProductRepository,
} from '../../../product/domain/repositories/product.repository.interface';
import {
  SAVED_PRODUCT_REPO,
  type ISavedProductRepository,
} from '../../../saved-product/domain/repositories/Isave-product.repository';
import {
  USER_REPO,
  type IUserDomainRepository,
} from '../../../users/domain/repositories/user.repository.interface';
// import {
//   AGENCY_REPO,
//   type IAgencyRepository,
// } from '../../../agency/domain/repositories/agency.repository.interface';
import { AGENCY_REPO , type IAgencyDomainRepository } from '../../../agency/domain/repositories/agency.repository.interface';
import { ProductClicksService } from '../../../product-clicks/product-clicks.service';

export interface DashboardStats {
  scope: 'user' | 'agency';
  activeProperties: number;
  totalClicks: number;
  totalSaves: number;
  totalProperties: number;
  clicksLast7Days: { date: string; clicks: number }[];
}

@Injectable()
export class GetUserStatsUseCase {
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepo: IProductRepository,
    @Inject(SAVED_PRODUCT_REPO)
    private readonly savedProductRepo: ISavedProductRepository,
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
    @Inject(AGENCY_REPO)
    private readonly agencyRepo: IAgencyDomainRepository,
    private readonly productClicksService: ProductClicksService,
  ) {}

  async execute(userId: number): Promise<DashboardStats> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      // Defensive fallback — should never happen with auth in place
      return this.emptyStats('user');
    }

    // Owner: aggregate stats across the WHOLE agency, not just their own products
    if (user.role === 'agency_owner') {
      const agency = await this.agencyRepo.findByOwnerUserId(userId);
      if (agency) {
        return this.buildStats('agency', agency.id, [
          this.productRepo.findStatsForAgency(agency.id),
          this.savedProductRepo.countSavesByAgency(agency.id),
        ]);
      }
      // Owner without agency yet — fall through to user-scoped stats
    }

    // Agent and normal user: only their own products
    return this.buildStats('user', userId, [
      this.productRepo.findStatsForUser(userId),
      this.savedProductRepo.countSavesByOwner(userId),
    ]);
  }

  private async buildStats(
    scope: 'user' | 'agency',
    _scopeId: number,
    promises: [
      ReturnType<IProductRepository['findStatsForUser']>,
      Promise<number>,
    ],
  ): Promise<DashboardStats> {
    const [products, savedCount] = await Promise.all(promises);

    const productIds = products.map((p) => String(p.id));
    const totalProperties = products.length;
    const activeProperties = products.filter(
      (p) => p.status === 'active',
    ).length;
    const totalClicks = products.reduce(
      (sum, p) => sum + (p.clickCount ?? 0),
      0,
    );

    const clicksLast7Days = await this.productClicksService.getClicksPerDay(
      productIds,
      7,
    );

    return {
      scope,
      activeProperties,
      totalClicks,
      totalSaves: savedCount,
      totalProperties,
      clicksLast7Days,
    };
  }

  private emptyStats(scope: 'user' | 'agency'): DashboardStats {
    const days: { date: string; clicks: number }[] = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), clicks: 0 });
    }
    return {
      scope,
      activeProperties: 0,
      totalClicks: 0,
      totalSaves: 0,
      totalProperties: 0,
      clicksLast7Days: days,
    };
  }
}