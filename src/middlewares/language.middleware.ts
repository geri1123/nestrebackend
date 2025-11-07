import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { translations, SupportedLang } from '../locales';

// 1️⃣ Extend Request type
export interface RequestWithLang extends Request {
  language: SupportedLang ;
}

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: RequestWithLang, res: Response, next: NextFunction) {
    const supported = Object.keys(translations) as SupportedLang[];

    // Cookie
    let lang = req.cookies?.NEXT_LOCALE as SupportedLang | undefined;

   
    if (!lang || !supported.includes(lang)) {
      lang = req.query.lang as SupportedLang;
    }

    //  Default fallback
    if (!lang || !supported.includes(lang)) {
      lang = 'al';
    }

    // Set language on request & response
    res.locals.lang = lang;
    req.language = lang; 

    // Optional: set cookie for persistence
    res.cookie('NEXT_LOCALE', lang, {
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    next();
  }
}
