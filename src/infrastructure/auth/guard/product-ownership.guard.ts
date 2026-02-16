import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { SupportedLang, t } from '../../../locales';
import { GetProductForPermissionUseCase } from '../../../modules/product/application/use-cases/get-product-for-permission.use-case';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProductOwnershipGuard implements CanActivate {
  constructor(private readonly getProductForPermission: GetProductForPermissionUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const productId = Number(req.params.id);
    const lang:SupportedLang = req.language;

    const product = await this.getProductForPermission.execute(productId, lang);

    if (req.user?.role === UserRole.agency_owner) {
      return this.validateAgencyOwnerAccess(req, product, lang);
    }

    if (req.user?.role === UserRole.agent) {
      return this.validateAgentAccess(req, product, lang);
    }

    return this.validateRegularUserAccess(req, product, lang);
  }

  
  private validateAgencyOwnerAccess(
    req: RequestWithUser,
    product: any,
    lang: SupportedLang
  ): boolean {
    if (product.agencyId !== req.agencyId) {
      throw new ForbiddenException(t('anotherAgency', lang));
    }
    return true;
  }

  
  private validateAgentAccess(
    req: RequestWithUser,
    product: any,
    lang: SupportedLang
  ): boolean {
    if (!req.agencyAgentId) {
      throw new ForbiddenException(t('noAgency', lang));
    }

    if (product.userId === req.userId) {
      return true;
    }

    if (product.agencyId === req.agencyId) {
      if (req.agentPermissions?.can_edit_others_post) {
        return true;
      }
      throw new ForbiddenException(t('insufficientPermissions', lang));
    }

    throw new ForbiddenException(t('cannotEditOthersProduct', lang));
  }

  private validateRegularUserAccess(
    req: RequestWithUser,
    product: any,
    lang: SupportedLang
  ): boolean {
    if (product.userId !== req.userId) {
      throw new ForbiddenException(t('cannotEditProduct', lang));
    }
    return true;
  }
}