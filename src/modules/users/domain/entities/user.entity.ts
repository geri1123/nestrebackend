export class User {
  constructor(
    public readonly id: number,
    public username: string,
    public readonly email: string,
    public firstName: string | null,
    public lastName: string | null,
    public aboutMe: string | null,
    public profileImg: string | null,
    public phone: string | null,
    public readonly role: 'user' | 'agency_owner' | 'agent',
    public readonly status: 'active' | 'inactive' | 'pending' | 'suspended',
    public readonly emailVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
    public readonly lastLogin: Date | null,
  ) {}

  static create(props: {
    id: number;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    about_me: string | null;
    profile_img: string | null;
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
      props.profile_img,
      props.phone,
      props.role as any,
      props.status as any,
      props.email_verified,
      props.created_at,
      props.updated_at,
      props.last_login,
    );
  }

  canUpdateUsername(lastChangeDate: Date | null, daysLimit: number = 60): boolean {
    if (!lastChangeDate) return true;
    const daysSinceLastChange = (Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastChange >= daysLimit;
  }

  isActive(): boolean {
    return this.status === 'active' && this.emailVerified;
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

    updateProfileImage(newUrl: string) {
    this.profileImg = newUrl;
  }

  removeProfileImage() {
    this.profileImg = null;
  }

  hasProfileImage(): boolean {
    return !!this.profileImg;
  }
}