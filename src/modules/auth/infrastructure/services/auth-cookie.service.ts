
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

const COOKIE_MAX_AGE = {
 ACCESS_SHORT:    6  * 60 * 60 * 1000,      // 6 h  (ms)
  ACCESS_REMEMBER: 3  * 24 * 60 * 60 * 1000, // 3 d
  REFRESH:        30  * 24 * 60 * 60 * 1000, // 30 d
} as const;

@Injectable()
export class AuthCookieService {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  // ── Shared base options
  private readonly baseOptions = {
    httpOnly: true,
    secure:   this.isProduction,                          
    sameSite: (this.isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    path:     '/',
  } as const;

  // ── Access cookie
  setAccessCookie(res: Response, token: string, rememberMe: boolean): void {
    res.cookie('token', token, {
      ...this.baseOptions,
      maxAge: rememberMe ? COOKIE_MAX_AGE.ACCESS_REMEMBER : COOKIE_MAX_AGE.ACCESS_SHORT,
    });
  }

  clearAccessCookie(res: Response): void {
    res.clearCookie('token', this.baseOptions);
  }

  // ── Refresh cookie 
  setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      ...this.baseOptions,
      maxAge: COOKIE_MAX_AGE.REFRESH,
      path:   '/auth/refresh',  
    });
  }

  clearRefreshCookie(res: Response): void {
    res.clearCookie('refreshToken', {
      ...this.baseOptions,
      path: '/auth/refresh',
    });
  }

  clearAllCookies(res: Response): void {
    this.clearAccessCookie(res);
    this.clearRefreshCookie(res);
  }
}