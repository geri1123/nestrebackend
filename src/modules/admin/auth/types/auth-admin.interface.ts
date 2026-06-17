import { AdminRole } from "@prisma/client";

export interface AuthAdmin{
    id:number;
    email:string;
    name:string ;
    role:AdminRole;
    createdAt:Date;
}