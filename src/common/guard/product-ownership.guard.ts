import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user.interface';
import { AgentService } from '../../modules/agent/agent.service';
import { AgencyService } from '../../modules/agency/agency.service';

import { ProductService } from '../../modules/product/product-service';

@Injectable()
export class ProductOwnershipAndPermissionGuard implements CanActivate {
  constructor(
    private readonly productService: ProductService,
    private readonly agentService:AgentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const productId = Number(req.params.id);
 const language=req.language;
    // fetch product from DB
    const product = await this.productService.getProductForPermissionCheck(productId , language);
  

    // =========================
    // Agency Owner: full access to own agency
    // =========================
    if (req.user && req.user.role === 'agency_owner') {
      if (product.agencyId !== req.agencyId) {
        throw new ForbiddenException("You cannot edit products from another agency");
      }
      return true;
    }

    
    // Agent: check ownership & permissions
    
    if (req.user && req.user.role === 'agent') {
      // agent must belong to an agency
      if (!req.agencyAgentId) throw new ForbiddenException("You are not associated with any agency");

      const agent = await this.agentService.getAgentWithPermissions(req.agencyAgentId);
      if (!agent) throw new ForbiddenException("Agent not found");

      // agent updating own product → allowed
      if (product.userId === req.userId) return true;

      // agent updating other’s product → allowed only if same agency & has permission
      if (
        agent.permission?.can_edit_others_post &&
        product.agencyId === req.agencyId
      ) return true;

      throw new ForbiddenException("You do not have permission to edit this product");
    }

  
    // Regular users: only own products
   
    if (product.userId !== req.userId) {
      throw new ForbiddenException("You cannot edit this product");
    }

    return true;
  }
}