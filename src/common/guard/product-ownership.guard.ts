import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user.interface';
import { t } from '../../locales';
import { ProductService } from '../../modules/product/services/product-service';
import { GetProductForPermissionUseCase } from '../../modules/product/application/use-cases/get-product-for-permission.use-case';
import { user_role } from '@prisma/client';

@Injectable()
export class ProductOwnershipAndPermissionGuard implements CanActivate {
  constructor(private readonly GetProductForPermission: GetProductForPermissionUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const productId = Number(req.params.id);
    const lang = req.language;

    const product = await this.GetProductForPermission.execute(productId, lang);

    
    if (req.user?.role === user_role.agency_owner) {
      if (product.agencyId !== req.agencyId) {
        throw new ForbiddenException(t('anotherAgency', lang));
      }
      return true;
    }

    //  Agent
    if (req.user?.role === user_role.agent) {
      if (!req.agencyAgentId) {
        throw new ForbiddenException(t('noAgency', lang));
      }

      
      if (product.userId === req.userId) return true;

     
      if (
        req.agentPermissions?.canEditOthersPost &&
        product.agencyId === req.agencyId
      ) {
        return true;
      }

      throw new ForbiddenException(t('cannotEditOthersProduct', lang));
    }


    if (product.userId !== req.userId) {
      throw new ForbiddenException(t('cannotEditProduct', lang));
    }

    return true;
  }
}
