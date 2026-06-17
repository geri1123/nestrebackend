import { Injectable } from '@nestjs/common';
import { Response } from 'express';

const COOKIE_MAX_AGE = {
  ACCESS_SHORT: 6  * 60 * 60 * 1000,
  REFRESH:      30 * 24 * 60 * 60 * 1000,
} as const;

@Injectable()
export class AdminAuthCookieService {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  private readonly baseOptions = {
    httpOnly: true,
    secure:   this.isProduction,
    sameSite: (this.isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path:     '/',
  } as const;

  // ── Access cookie
  setAccessCookie(res: Response, token: string): void {
    res.cookie('admin_token', token, {       
      ...this.baseOptions,
      maxAge: COOKIE_MAX_AGE.ACCESS_SHORT,
    });
  }

  clearAccessCookie(res: Response): void {
    res.clearCookie('admin_token', this.baseOptions);   
  }

  // ── Refresh cookie
  setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie('admin_refresh_token', refreshToken, {   
      ...this.baseOptions,
      maxAge: COOKIE_MAX_AGE.REFRESH,
      path:   '/auth/refresh',
    });
  }

  clearRefreshCookie(res: Response): void {
    res.clearCookie('admin_refresh_token', {           
      ...this.baseOptions,
    path: '/admin/auth/refresh',
    });
  }

  clearAllCookies(res: Response): void {
    this.clearAccessCookie(res);
    this.clearRefreshCookie(res);
  }
}