import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ADMIN_REPOSITORY_TOKENS } from "../domain/repositories/admin.repository.tokens";
import { IAdminRepository } from "../domain/repositories/admin.repository.interface";
import { AdminTokenService } from "../services/admin-auth-token.service";
import { AdminAuthCookieService } from "../services/admin-cookie.service";
import { LoginAdminDto } from "../dto/login-admin.dto";
import { Response } from 'express';
interface Login {
  email: string;
  password: string;
}

@Injectable()
export class LoginAdmin {
  constructor(
    @Inject(ADMIN_REPOSITORY_TOKENS.ADMIN_REPOSITORY)
    private readonly adminRepo: IAdminRepository,
    private readonly adminTokenService: AdminTokenService,
    private readonly adminAuthCookieService: AdminAuthCookieService,
  ) {}

  async execute(dto: LoginAdminDto, res: Response) {
    // 1. Kontrollo nese ekziston admini
    // const admin = await this.adminRepo.findAdminByEmail(dto.email);

    // if (!admin) {
    //   throw new UnauthorizedException({
    //     success: false,
    //     message: "Email ose fjalëkalimi është i gabuar",
    //   });
    // }

    // // 2. Verifiko passwordin përmes domain entity
    // const isPasswordValid = await admin.verifyPassword(dto.password);
  
  
  const admin = await this.adminRepo.findAdminByEmail(dto.email);
 

  if (!admin) {
    throw new UnauthorizedException({
      success: false,
      message: "Email ose fjalëkalimi është i gabuar",
    });
  }

  const isPasswordValid = await admin.verifyPassword(dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        success: false,
        message: "Email ose fjalëkalimi është i gabuar",
      });
    }

    // 3. Gjenero token me AdminTokenService
    const token = this.adminTokenService.generateAdminToken(admin.id);

    // 4. Vendos cookie me AdminAuthCookieService
    this.adminAuthCookieService.setAccessCookie(res, token);

    return {
      success: true,
      message: "Login u krye me sukses",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }
}