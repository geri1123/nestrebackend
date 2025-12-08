import { Injectable } from '@nestjs/common';
import { LanguageCode } from '@prisma/client';
import { SupportedLang } from '../../locales';
import { translateAgentChanges } from '../agent/application/helpers/agent-change-translator';

type TemplateFn = (user: any) => string;

type NotificationTemplates = {
  [type: string]: {
    [key in LanguageCode]?: TemplateFn;
  };
};

@Injectable()
export class NotificationTemplateService {
  private readonly templates: NotificationTemplates = {
    agent_email_confirmed: {
      [LanguageCode.al]: (user) =>
        `${user.username || 'Përdoruesi'} ka konfirmuar email-in dhe dëshiron të bashkohet me agjensionin tuaj.`,
      [LanguageCode.en]: (user) =>
        `${user.username || 'User'} has confirmed their email and wants to join your agency.`,
      [LanguageCode.it]: (user) =>
        `${user.username || 'Utente'} ha confermato la propria email e desidera unirsi alla tua agenzia.`,
    },
    agency_confirm_agent: {
      [LanguageCode.al]: () =>
        `Agjensia juaj ka aprovuar kërkesën tuaj për t'u bashkuar. Mirë se erdhët në ekip!`,
      [LanguageCode.en]: () =>
        `Your request to join the agency has been approved. Welcome to the team!`,
      [LanguageCode.it]: () =>
        `La tua richiesta di unirti all'agenzia è stata approvata. Benvenuto nel team!`,
    },
  user_send_request: {
  [LanguageCode.al]: (data) =>
    `${data.username} kërkon të bashkohet me agjencinë tuaj.`,
  [LanguageCode.en]: (data) =>
    `${data.username} wants to join your agency.`,
  [LanguageCode.it]: (data) =>
    `${data.username} vuole unirsi alla vostra agenzia.`,
},
   agent_updated_by_agent: {
  [LanguageCode.al]: (data) =>
    `${data.updatedByName} ka përditësuar informacionet tuaj: ${data.changesText}.`,
  [LanguageCode.en]: (data) =>
    `${data.updatedByName} has updated your information: ${data.changesText}.`,
  [LanguageCode.it]: (data) =>
    `${data.updatedByName} ha aggiornato le tue informazioni: ${data.changesText}.`,
}
  };


  getAllTranslations(type: string, user: any) {
    const typeTemplates = this.templates[type];
    if (!typeTemplates) return [];

    return (Object.entries(typeTemplates) as [LanguageCode, TemplateFn][]).map(
      ([languageCode, fn]) => ({
        languageCode,
        message: fn(user),
      }),
    );
  }

  
  getTemplate(type: string, user: any, language: SupportedLang) {
    const typeTemplates = this.templates[type];
    if (!typeTemplates) return '';
    const templateFn =
      typeTemplates[language as LanguageCode] ||
      typeTemplates[LanguageCode.en];
    return templateFn ? templateFn(user) : '';
  }
}
