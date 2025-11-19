import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user.interface';
import { t } from '../../locales';
import { ProductService } from '../../modules/product/services/product-service';

@Injectable()
export class ProductOwnershipAndPermissionGuard implements CanActivate {
  constructor(private readonly productService: ProductService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const productId = Number(req.params.id);
    const lang = req.language;

    const product = await this.productService.getProductForPermissionCheck(productId, lang);
    if (!product) throw new ForbiddenException(t('productNotFound', lang));

    
    if (req.user?.role === 'agency_owner') {
      if (product.agencyId !== req.agencyId) {
        throw new ForbiddenException(t('anotherAgency', lang));
      }
      return true;
    }

    //  Agent: limited permissions
    if (req.user?.role === 'agent') {
      if (!req.agencyAgentId) {
        throw new ForbiddenException(t('noAgency', lang));
      }

      // Can edit their own product
      if (product.userId === req.userId) return true;

      // Can edit others’ products only if permission allows
      if (
        req.agentPermissions?.can_edit_others_post &&
        product.agencyId === req.agencyId
      ) {
        return true;
      }

      throw new ForbiddenException(t('cannotEditOthersProduct', lang));
    }

    // Regular users: can only edit their own products
    if (product.userId !== req.userId) {
      throw new ForbiddenException(t('cannotEditProduct', lang));
    }

    return true;
  }
}
