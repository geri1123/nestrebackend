import { Injectable } from "@nestjs/common";
import { Response } from "express";

@Injectable()
export class AuthCookieService {
  private readonly cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  } as const;

  setAuthCookie(res: Response, token: string, rememberMe: boolean) {
    const maxAge = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    res.cookie("token", token, {
      ...this.cookieOptions,
      maxAge,
    });
  }

  clearAuthCookie(res: Response) {
    res.clearCookie("token", this.cookieOptions);
  }
}