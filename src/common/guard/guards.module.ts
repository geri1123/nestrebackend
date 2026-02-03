import { Global, Module } from '@nestjs/common';

// Infrastructure
import { AuthContextModule } from '../../infrastructure/auth/modules/auth-context.module';

// IMPORTANT: Import AgentModule and AgencyModule here, not in AppModule
import { AgentModule } from '../../modules/agent/agent.module';
import { AgencyModule } from '../../modules/agency/agency.module';
import { ProductModule } from '../../modules/product/product.module';

// Guards
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './role-guard';
import { PermissionsGuard } from './permissions.guard';
// import { StatusGuard } from './status.guard';
import { AgencyContextGuard } from './agency-context.guard';
import { AgentBelongsToAgencyGuard } from './agent-belongs-to-agency.guard';
import { ProductOwnershipGuard } from './product-ownership.guard';

@Global()
@Module({
  imports: [
    AuthContextModule,
    AgentModule,
    AgencyModule,
    ProductModule,
  ],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    AgencyContextGuard,
    AgentBelongsToAgencyGuard,
    ProductOwnershipGuard,
  ],
  exports: [
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    AgencyContextGuard,
    AgentBelongsToAgencyGuard,
    ProductOwnershipGuard,
  ],
})
export class GuardsModule {}