import { AsyncLocalStorage } from 'node:async_hooks';
import { SupportedLang } from '../../locales';
export interface RequestContext {
  language: SupportedLang;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();