import { ForbiddenException } from '@nestjs/common';
import { user_status } from '@prisma/client';
import type { BaseUserInfo } from '../../types/base-user-info';
import type { PartialUserForLogin } from '../../../../common/types/user';
import { SupportedLang , t} from '../../../../locales';

export class User {
  constructor(
    private readonly props: {
      id: number;
      username: string;
      email: string;
      status: user_status;
      role?: string | null;
      profile_img?: string | null;
      first_name?: string | null;
      password?: string | null;
    },
  ) {}

  get id() {
    return this.props.id;
  }

  get username() {
    return this.props.username;
  }

  get email() {
    return this.props.email;
  }

  get status() {
    return this.props.status;
  }

  get role() {
    return this.props.role ?? '';
  }

  get profileImage() {
    return this.props.profile_img ?? null;
  }

  get firstName() {
    return this.props.first_name ?? null;
  }

  get first_name() {
    return this.firstName;
  }

  get password() {
    return this.props.password ?? null;
  }

  isActive() {
    return this.props.status === 'active';
  }

  assertActive(language: SupportedLang) {
    if (!this.isActive()) {
      throw new ForbiddenException({
        success: false,
        message: t('validationFailed', language),
        errors: { email: [t('accountNotActive', language)] },
      });
    }
  }

  static fromLogin(user: PartialUserForLogin) {
    return new User({
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role,
      first_name: user.first_name,
      password: user.password,
    });
  }

  static fromBase(info: BaseUserInfo) {
    return new User({
      id: info.id,
      username: info.username,
      email: info.email,
      status: info.status,
      role: info.role,
      profile_img: info.profile_img,
      first_name: info.first_name,
    });
  }

  static fromEmailLookup(user: {
    id: number;
    email: string;
    status: user_status;
    username?: string | null;
    role?: string | null;
    first_name?: string | null;
  }) {
    return new User({
      id: user.id,
      username: user.username ?? user.email,
      email: user.email,
      status: user.status,
      role: user.role,
      first_name: user.first_name,
    });
  }
}