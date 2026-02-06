import { Global, Module } from '@nestjs/common';
import { AuthContextModule } from './auth-context.module';
import { AgencyContextModule } from './agency-context.module';
import { ProductModule } from '../../../modules/product/product.module';
import { AgentModule } from '../../../modules/agent/agent.module';

// Guards
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolesGuard } from '../guard/role-guard';
import { PermissionsGuard } from '../guard/permissions.guard';
import { AgencyContextGuard } from '../guard/agency-context.guard';
import { AgentBelongsToAgencyGuard } from '../guard/agent-belongs-to-agency.guard';
import { ProductOwnershipGuard } from '../guard/product-ownership.guard';
@Global()
@Module({
  imports: [
    AuthContextModule,
    AgencyContextModule,
    ProductModule,
    AgentModule,
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

// import { Global, Module } from '@nestjs/common';
// import { AuthContextModule } from './auth-context.module';
// import { AgencyContextModule } from './agency-context.module';
// import { ProductModule } from '../../../modules/product/product.module';
// import { AgentModule } from '../../../modules/agent/agent.module';

// // Guards
// import { JwtAuthGuard } from '../guard/jwt-auth.guard';
// import { RolesGuard } from '../guard/role-guard';
// import { PermissionsGuard } from '../guard/permissions.guard';
// import { AgencyContextGuard } from '../guard/agency-context.guard';
// import { AgentBelongsToAgencyGuard } from '../guard/agent-belongs-to-agency.guard';
// import { ProductOwnershipGuard } from '../guard/product-ownership.guard';

// @Global()
// @Module({
//   imports: [
//     AuthContextModule,
//     AgencyContextModule,
//     ProductModule,
//     AgentModule,
//   ],
//   providers: [
//     JwtAuthGuard,
//     RolesGuard,
//     PermissionsGuard,
//     AgencyContextGuard,
//     AgentBelongsToAgencyGuard,
//     ProductOwnershipGuard,
//   ],
//   exports: [
//     JwtAuthGuard,
//     RolesGuard,
//     PermissionsGuard,
//     AgencyContextGuard,
//     AgentBelongsToAgencyGuard,
//     ProductOwnershipGuard,
//   ],
// })
// export class GuardsModule {}