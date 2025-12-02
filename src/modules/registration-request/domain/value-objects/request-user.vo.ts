import { userRole } from "../../../users/domain/types/user-role.type";
import { userStatus } from "../../../users/domain/types/user-status.type";

export class RequestUserVO {
  constructor(
    public readonly email: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly role: userRole,
    public readonly status: userStatus,
  ) {}
}