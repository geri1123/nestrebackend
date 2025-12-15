import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { translations, SupportedLang } from '../locales';


export interface RequestWithLang extends Request {
  language: SupportedLang ;
}

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: RequestWithLang, res: Response, next: NextFunction) {
    const supported = Object.keys(translations) as SupportedLang[];

    let lang: SupportedLang | undefined;

    //  Header (mobile + web)
    const headerLang =
      req.headers['x-lang'] ||
      req.headers['accept-language'];

    if (typeof headerLang === 'string') {
      lang = headerLang.split(',')[0] as SupportedLang;
    }

    // Cookie (web)
    if (!lang || !supported.includes(lang)) {
      lang = req.cookies?.NEXT_LOCALE as SupportedLang;
    }

    //  Query param (fallback)
    if (!lang || !supported.includes(lang)) {
      lang = req.query.lang as SupportedLang;
    }

    // Default
    if (!lang || !supported.includes(lang)) {
      lang = 'al';
    }

    req.language = lang;
    res.locals.lang = lang;

    // Only set cookie for browser clients
    if (!req.headers['x-mobile-app']) {
      res.cookie('NEXT_LOCALE', lang, {
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
    }

    next();
  }
}

