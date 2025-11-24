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

    // Cookie
    let lang = req.cookies?.NEXT_LOCALE as SupportedLang | undefined;

   
    if (!lang || !supported.includes(lang)) {
      lang = req.query.lang as SupportedLang;
    }

    
    if (!lang || !supported.includes(lang)) {
      lang = 'al';
    }

    
    res.locals.lang = lang;
    req.language = lang; 

    
    res.cookie('NEXT_LOCALE', lang, {
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    next();
  }
}
