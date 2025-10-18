import { Module } from '@nestjs/common';
import { AgencyRepository } from "./agency.repository";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [AgencyRepository],
  exports: [AgencyRepository],
})
export class AgencyRepositoryModule {}