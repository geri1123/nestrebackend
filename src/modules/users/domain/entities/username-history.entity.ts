export class UsernameHistory {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly oldUsername: string,
    public readonly newUsername: string,
    public readonly nextUsernameUpdate: Date,
  ) {}

  static create(props: {
    id: number;
    user_id: number;
    old_username: string;
    new_username: string;
    next_username_update: Date;
  }): UsernameHistory {
    return new UsernameHistory(
      props.id,
      props.user_id,
      props.old_username,
      props.new_username,
      props.next_username_update,
    );
  }
}