import { userRole } from "../types/user-role.type";
import { userStatus } from "../types/user-status.type";

export class User {
  constructor(
    public readonly id: number,
    public username: string,
    public readonly email: string,
    public firstName: string | null,
    public lastName: string | null,
    public aboutMe: string | null,
    public profileImgUrl: string | null,
    public profileImgPublicId: string | null,
    public phone: string | null,
    public readonly role: userRole,
    public readonly status: userStatus,
    public readonly emailVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
    public readonly lastLogin: Date | null,
  ) {}

  /* ---------- FACTORY ---------- */
  static create(props: {
    id: number;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    about_me: string | null;
    profile_img_url: string | null;
    profile_img_public_id: string | null;
    phone: string | null;
    role: string;
    status: string;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date | null;
    last_login: Date | null;
  }): User {
    return new User(
      props.id,
      props.username,
      props.email,
      props.first_name,
      props.last_name,
      props.about_me,
      props.profile_img_url,
      props.profile_img_public_id,
      props.phone,
      props.role as userRole,
      props.status as userStatus,
      props.email_verified,
      props.created_at,
      props.updated_at,
      props.last_login,
    );
  }

  /* ---------- DOMAIN RULES ---------- */

  isActive(): boolean {
    return this.status === 'active' && this.emailVerified;
  }

  canUpdateUsername(lastChangeDate: Date | null, daysLimit = 60): boolean {
    if (!lastChangeDate) return true;
    const days =
      (Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24);
    return days >= daysLimit;
  }

  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    aboutMe?: string;
    phone?: string;
  }): void {
    if (data.firstName !== undefined) this.firstName = data.firstName;
    if (data.lastName !== undefined) this.lastName = data.lastName;
    if (data.aboutMe !== undefined) this.aboutMe = data.aboutMe;
    if (data.phone !== undefined) this.phone = data.phone;
  }

  /* ---------- IMAGE LOGIC ---------- */

  updateProfileImage(url: string, publicId: string) {
    this.profileImgUrl = url;
    this.profileImgPublicId = publicId;
  }

  removeProfileImage() {
    this.profileImgUrl = null;
    this.profileImgPublicId = null;
  }

  hasProfileImage(): boolean {
    return !!this.profileImgUrl;
  }
}