import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import { IUserDomainRepository, USER_REPO } from "../../../users/domain/repositories/user.repository.interface";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { EMAIL_EVENTS, EmailStatusChangeEvent } from "../../../../infrastructure/events/email/email.events";

@Injectable()
export class ChangeUserStatusUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
    private readonly eventEmitter:EventEmitter2,
  ) {}

  async execute(
    userId: number,
    status: UserStatus,
  ) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated=await this.userRepo.updateStatus(
      userId,
      status,
    );

    this.eventEmitter.emit(
  EMAIL_EVENTS.STATUS_USER_MESSAGE,
  new EmailStatusChangeEvent({
    email: user.email,
    name: user.firstName ?? user.username,
    status,
  }),
);
    return {
      success: true,
    };
  }
}