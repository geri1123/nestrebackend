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
import { INotificationRepository, NOTIFICATION_REPO } from '../../../notification/domain/repository/notification.repository.interface';
import { NotificationService } from '../../../notification/notification.service';

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
    @Inject(NOTIFICATION_REPO)
    private readonly notificationRepo: INotificationRepository,
    private readonly authContextService:AuthContextService,
    private readonly notificationService: NotificationService,
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
const notifications: Array<{
    userId: number;
    type: string;
    templateData: any;
  }> = [];
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
  await this.productRepo.transferAgentProducts(
    userId,
    agencyId,
    ownerUserId,
    tx,
  );

  notifications.push({
    userId: ownerUserId,
    type: 'agent_delete_profile',
    templateData: {
      agentName: `${user.firstName} ${user.lastName}`,
    },
  });
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
    const agentRecords = await tx.agencyAgent.findMany({
      where: { agencyId: agency.id },
      select: { agentId: true },
    });

    if (agentRecords.length > 0) {
      await tx.user.updateMany({
        where: { id: { in: agentRecords.map((a) => a.agentId) } },
        data: { role: 'user' },
      });

      notifications.push(
        ...agentRecords.map((agent) => ({
          userId: agent.agentId,
          type: 'agency_deleted',
          templateData: { agencyName: agency.agencyName },
        })),
      );
    }

    await tx.product.updateMany({
      where: {
        agencyId: agency.id,
        userId: { not: userId }, 
      },
      data: { agencyId: null },
    });

  
    await tx.product.deleteMany({
      where: {
        agencyId: agency.id,
        userId: userId, 
      },
    });

    await tx.agencyAgent.deleteMany({ where: { agencyId: agency.id } });

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

      //fshi notifications
      await this.notificationRepo.deleteNotificationsByUserId(userId, tx);
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
           google_id:          null,
        },
      });

    }); }  catch (error) {
    this.logger.error(`Failed to delete user ${userId}`, error);
    throw new InternalServerErrorException({
      success: false,
      message: 'Failed to delete user. Please try again.',
    });
  }
 await Promise.all(
    notifications.map((notification) =>
      this.notificationService.sendNotification({
        userId: notification.userId,
        type: notification.type,
        templateData: notification.templateData,
      }),
    ),
  );
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

  if (profileImgPublicId) {
    ids.push(profileImgPublicId);
  }

  // Imazhet e produkteve — për 'user' dhe 'agency_owner'
  if (role === 'user' || role === 'agency_owner') {
    const images = await this.prisma.productImage.findMany({
      where: { userId },
      select: { publicId: true },
    });

    for (const img of images) {
      if (img.publicId) ids.push(img.publicId);
    }
  }

  if (role === 'agency_owner') {
    const agency = await this.prisma.agency.findUnique({
      where: { ownerUserId: userId },
      select: { logoPublicId: true },
    });

    if (agency?.logoPublicId) {
      ids.push(agency.logoPublicId);
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