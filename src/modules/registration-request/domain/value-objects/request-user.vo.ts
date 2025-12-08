import { userRole } from "../../../users/domain/types/user-role.type";
import { userStatus } from "../../../users/domain/types/user-status.type";


export class RequestUserVO {

  constructor(
    public readonly email: string,
    private readonly first_name: string | null,
    private readonly last_name: string | null,
    public readonly role: userRole,
    public readonly status: userStatus,
  ) {}

  
  get firstName(): string | null {
    return this.first_name;
  }

  get lastName(): string | null {
    return this.last_name;
  }
}