import { userRole } from "../../../users/domain/types/user-role.type";
import { userStatus } from "../../../users/domain/types/user-status.type";


export class RequestUserVO {

  constructor(
    public readonly email: string,
    private readonly first_name: string ,
    private readonly last_name: string ,
    public readonly role: userRole,
    public readonly status: userStatus,
    public readonly username:string,
  ) {}

  
  get firstName(): string  {
    return this.first_name;
  }

  get lastName(): string  {
    return this.last_name;
  }
   
}