// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { RequestWithUser } from '../types/request-with-user.interface';
// import { t } from '../../locales';

// import { GetProductForPermissionUseCase } from '../../modules/product/application/use-cases/get-product-for-permission.use-case';
// import { user_role } from '@prisma/client';

// @Injectable()
// export class ProductOwnershipAndPermissionGuard implements CanActivate {
//   constructor(private readonly GetProductForPermission: GetProductForPermissionUseCase) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest<RequestWithUser>();
//     const productId = Number(req.params.id);
//     const lang = req.language;

//     const product = await this.GetProductForPermission.execute(productId, lang);

    
//     if (req.user?.role === user_role.agency_owner) {
//       if (product.agencyId !== req.agencyId) {
//         throw new ForbiddenException(t('anotherAgency', lang));
//       }
//       return true;
//     }

//     //  Agent
//     if (req.user?.role === user_role.agent) {
//       if (!req.agencyAgentId) {
//         throw new ForbiddenException(t('noAgency', lang));
//       }

      
//       if (product.userId === req.userId) return true;

     
//       if (
//         req.agentPermissions?.canEditOthersPost &&
//         product.agencyId === req.agencyId
//       ) {
//         return true;
//       }

//       throw new ForbiddenException(t('cannotEditOthersProduct', lang));
//     }


//     if (product.userId !== req.userId) {
//       throw new ForbiddenException(t('cannotEditProduct', lang));
//     }

//     return true;
//   }
// }

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { RequestWithUser } from '../types/request-with-user.interface';
import { t } from '../../locales';
import { GetProductForPermissionUseCase } from '../../modules/product/application/use-cases/get-product-for-permission.use-case';
import { user_role } from '@prisma/client';

@Injectable()
export class ProductOwnershipGuard implements CanActivate {
  private getProductForPermission: GetProductForPermissionUseCase;

  constructor(private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lazy load dependency
    if (!this.getProductForPermission) {
      this.getProductForPermission = this.moduleRef.get(GetProductForPermissionUseCase, { strict: false });
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const productId = Number(req.params.id);
    const lang = req.language;

    const product = await this.getProductForPermission.execute(productId, lang);

    // Agency owner
    if (req.user?.role === user_role.agency_owner) {
      if (product.agencyId !== req.agencyId) {
        throw new ForbiddenException(t('anotherAgency', lang));
      }
      return true;
    }

    // Agent
    if (req.user?.role === user_role.agent) {
      if (!req.agencyAgentId) {
        throw new ForbiddenException(t('noAgency', lang));
      }

      if (product.userId === req.userId) return true;

      if (
        req.agentPermissions?.can_edit_own_post &&
        product.agencyId === req.agencyId
      ) {
        return true;
      }

      throw new ForbiddenException(t('cannotEditOthersProduct', lang));
    }

    // Regular user
    if (product.userId !== req.userId) {
      throw new ForbiddenException(t('cannotEditProduct', lang));
    }

    return true;
  }
}