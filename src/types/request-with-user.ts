import { Request } from 'express';
import { SupportedLang } from '../locales';

export interface RequestWithUserAndLang extends Request {
  userId: number;
  user: any; 
  language: SupportedLang;
}