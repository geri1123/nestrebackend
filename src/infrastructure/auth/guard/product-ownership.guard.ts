import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { SupportedLang, t } from '../../../locales';
import { GetProductForPermissionUseCase } from '../../../modules/product/application/use-cases/get-product-for-permission.use-case';
import { user_role } from '@prisma/client';

/**
 * Guard to verify product ownership and permissions
 */
@Injectable()
export class ProductOwnershipGuard implements CanActivate {
  constructor(private readonly getProductForPermission: GetProductForPermissionUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const productId = Number(req.params.id);
    const lang:SupportedLang = req.language;

    const product = await this.getProductForPermission.execute(productId, lang);

    // Agency owner can edit products in their agency
    if (req.user?.role === user_role.agency_owner) {
      return this.validateAgencyOwnerAccess(req, product, lang);
    }

    // Agent can edit their own or others' products (with permission)
    if (req.user?.role === user_role.agent) {
      return this.validateAgentAccess(req, product, lang);
    }

    // Regular user can only edit their own products
    return this.validateRegularUserAccess(req, product, lang);
  }

  /**
   * Validate agency owner access
   */
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

  /**
   * Validate agent access
   */
  private validateAgentAccess(
    req: RequestWithUser,
    product: any,
    lang: SupportedLang
  ): boolean {
    if (!req.agencyAgentId) {
      throw new ForbiddenException(t('noAgency', lang));
    }

    // Agent can edit their own products
    if (product.userId === req.userId) {
      return true;
    }

    // Agent can edit other agents' products in same agency (with permission)
    if (product.agencyId === req.agencyId) {
      if (req.agentPermissions?.can_edit_others_post) {
        return true;
      }
      throw new ForbiddenException(t('insufficientPermissions', lang));
    }

    throw new ForbiddenException(t('cannotEditOthersProduct', lang));
  }

  /**
   * Validate regular user access
   */
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