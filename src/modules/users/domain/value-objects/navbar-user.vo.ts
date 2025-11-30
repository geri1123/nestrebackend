export class NavbarUser {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly profileImg: string | null,
    public readonly lastLogin: Date | null,
    public readonly role: string,
  ) {}
}
