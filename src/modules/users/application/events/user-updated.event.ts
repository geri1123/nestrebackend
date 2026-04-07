export class UserUpdatedEvent {
  constructor(
    public readonly userId: number,
    public readonly updatedFields: Partial<{
      username: string;
      email: string;
      profileImgUrl: string;
      role: string;
    }>,
  ) {}
}