import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';

import { USER_REPO, IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { PRODUCT_REPO, IProductRepository } from '../../../product/domain/repositories/product.repository.interface';
import { AGENCY_REPO, IAgencyDomainRepository } from '../../../agency/domain/repositories/agency.repository.interface';
import { AGENT_REPOSITORY_TOKENS } from '../../../agent/domain/repositories/agent.repository.tokens';
import { IAgentDomainRepository } from '../../../agent/domain/repositories/agents.repository.interface';
import { REG_REQ_TOKEN } from '../../../registration-request/domain/repositories/reg-req.repository.token';
import { IRegistrationRequestRepository } from '../../../registration-request/domain/repositories/registration-request.repository.interface';
import { IReviewRepository, REVIEW_REPO } from '../../../review/domain/repositories/review-repository.interface';
import { AuthContextService } from '../../../../infrastructure/auth/services/auth-context.service';
import { ISavedProductRepository, SAVED_PRODUCT_REPO } from '../../../saved-product/domain/repositories/Isave-product.repository';

@Injectable()
export class DeleteUserByIdUseCase{
  private readonly logger = new Logger(DeleteUserByIdUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,

    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,

    @Inject(PRODUCT_REPO)
    private readonly productRepo: IProductRepository,

    @Inject(AGENCY_REPO)
    private readonly agencyRepo: IAgencyDomainRepository,

    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,

    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY)
    private readonly regReqRepo: IRegistrationRequestRepository,
    @Inject(REVIEW_REPO)
    private readonly reviewRepo: IReviewRepository,
    @Inject(SAVED_PRODUCT_REPO)
    private readonly savedProductRepo: ISavedProductRepository,
    
    private readonly authContextService:AuthContextService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // ENTRY POINT
  // ─────────────────────────────────────────────────────────────────────────

  async execute(userId: number): Promise<void> {
    // ── 1. Lexo userin — jashtë TX, vetëm read ──────────────────────────────
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    // ── 2. Mblidh publicIds për Cloudinary PARA TX ──────────────────────────
    //    (pas TX të dhënat ndryshojnë — produktet fshihen, user soft-deleted)
    const cloudinaryPublicIds = await this.collectCloudinaryIds(userId, user.role, user.profileImgPublicId);

   try {
    await this.prisma.$transaction(async (tx) => {

      // ── ROLE: user ────────────────────────────────────────────────────────
      if (user.role === 'user') {
        // Produktet fshihen direkt — SavedProduct, ProductImage,
        // ProductAttributeValue, ProductAdvertisement fshihen me cascade
        await tx.product.deleteMany({ where: { userId } });
      }

      // ── ROLE: agent ───────────────────────────────────────────────────────
      if (user.role === 'agent') {
        const agencyId = await this.agentRepo.findAgencyIdByAgent(userId);

        if (agencyId) {
          // Gjej ownerId për të transferuar produktet
          const ownerUserId = await this.agencyRepo.findOwnerUserId(agencyId);

          if (ownerUserId) {
            // Produktet e agjentit → tek agency owner
            await this.productRepo.transferAgentProducts(userId, agencyId, ownerUserId, tx);
          }

          // Fshi AgencyAgent record
          // AgencyAgentPermission fshihet automatikisht (onDelete: Cascade)
          await tx.agencyAgent.deleteMany({ where: { agentId: userId } });
        }

        // Fshi kërkesat e regjistrimit
        await this.regReqRepo.deleteByUserId(userId, tx);
      }

      // ── ROLE: agency_owner ────────────────────────────────────────────────
      if (user.role === 'agency_owner') {
        const agency = await this.agencyRepo.findByOwnerUserId(userId);

        if (agency) {
          // Gjej të gjithë agjentët e kësaj agjence
          const agentRecords = await tx.agencyAgent.findMany({
            where: { agencyId: agency.id },
            select: { agentId: true },
          });

          // Kthe agjentët në role 'user'
          if (agentRecords.length > 0) {
            await tx.user.updateMany({
              where: { id: { in: agentRecords.map((a) => a.agentId) } },
              data: { role: 'user' },
            });
          }

          // Hiq agencyId nga TË GJITHA produktet e agjencisë
          // (produktet e agjentëve + produktet e owner-it)
          await tx.product.updateMany({
            where: { agencyId: agency.id },
            data: { agencyId: null },
          });

          // Fshi të gjithë AgencyAgent records
          // AgencyAgentPermission fshihet automatikisht (onDelete: Cascade)
          await tx.agencyAgent.deleteMany({ where: { agencyId: agency.id } });

          // Fshi agjencine
          // Reviews fshihen automatikisht (onDelete: Cascade)
          await tx.agency.delete({ where: { id: agency.id } });
        }

        // Fshi kërkesat e regjistrimit
        await this.regReqRepo.deleteByUserId(userId, tx);
      }

      // ── TË PËRBASHKËTA PËR TË GJITHA ROLET ──────────────────────────────
// Fshi produktet e saved
await this.savedProductRepo.deleteAllByUserId(userId, tx);
      // Fshi username history (e dhënë personale, pa vlerë biznesore)
      await tx.usernameHistory.deleteMany({ where: { userId } });
      //Fshi reviews
      await this.reviewRepo.deleteByUserId(userId, tx);
      // Soft delete: anonimizo email + username, set deletedAt
      // Kjo lëshon email/username origjinal për regjistrim të ri
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          status:    'inactive',
          email:     `deleted_${userId}_${user.email}`,
          username:  `deleted_${userId}_${user.username}`,
          profileImgUrl:      null,   
          profileImgPublicId: null, 
        },
      });

    }); }  catch (error) {
    this.logger.error(`Failed to delete user ${userId}`, error);
    throw new InternalServerErrorException({
      success: false,
      message: 'Failed to delete user. Please try again.',
    });
  }

await this.authContextService.invalidateContext(userId);
    await this.deleteFromCloudinary(cloudinaryPublicIds);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE: Mblidh publicIds sipas rolit
  // ─────────────────────────────────────────────────────────────────────────

  private async collectCloudinaryIds(
    userId: number,
    role: string,
    profileImgPublicId: string | null | undefined,
  ): Promise<string[]> {
    const ids: string[] = [];

    // Profile image — për TË GJITHA rolet
    if (profileImgPublicId) {
      ids.push(profileImgPublicId);
    }

    // Imazhet e produkteve — VETËM për role 'user'
    // Për agent: produktet transferohen → imazhet mbeten
    // Për agency_owner: agencyId bëhet null → imazhet mbeten
    if (role === 'user') {
      const images = await this.prisma.productImage.findMany({
        where: { userId },
        select: { publicId: true },
      });

      for (const img of images) {
        if (img.publicId) ids.push(img.publicId);
      }
    }

    return ids;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE: Fshi nga Cloudinary me chunk + error handling
  // ─────────────────────────────────────────────────────────────────────────

  private async deleteFromCloudinary(publicIds: string[]): Promise<void> {
    if (publicIds.length === 0) return;

    // Cloudinary mbështet max 100 publicIds për kërkesë
    const chunks = this.chunkArray(publicIds, 100);

    for (const chunk of chunks) {
      // Çdo publicId fshihet individualisht — CloudinaryService.deleteFile
      // hedh error nëse dështon; i kapim këtu për të mos crash-uar flow-n
      const results = await Promise.allSettled(
        chunk.map((publicId) => this.cloudinary.deleteFile(publicId)),
      );

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'rejected') {
          // Log por vazhdo — DB është konsistente tashmë
          // Mundësi: shto retry queue (BullMQ) për imazhet e dështuara
          this.logger.error(
            `Failed to delete Cloudinary image: ${chunk[i]}`,
            result.reason,
          );
        }
      }
    }
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
}