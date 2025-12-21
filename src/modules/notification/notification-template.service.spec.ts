import { LanguageCode } from '@prisma/client';
import { NotificationTemplateService } from './notifications-template.service';
describe('NotificationTemplateService', () => {
  let service: NotificationTemplateService;

  beforeEach(() => {
    service = new NotificationTemplateService();
  });

  it('returns Albanian template', () => {
    const result = service.getTemplate(
      'agent_email_confirmed',
      { username: 'Ardit' },
      'al',
    );

    expect(result).toContain('Ardit');
  });

  it('returns English template', () => {
    const result = service.getTemplate(
      'agent_email_confirmed',
      { username: 'John' },
      'en',
    );

    expect(result).toContain('John');
  });

  it('falls back to English if language missing', () => {
    const result = service.getTemplate(
      'agent_email_confirmed',
      { username: 'Mario' },
      'it',
    );

    expect(result).toContain('Mario');
  });

  it('returns empty string for unknown type', () => {
    const result = service.getTemplate('unknown_type', {}, 'al');
    expect(result).toBe('');
  });

  it('returns all translations', () => {
    const translations = service.getAllTranslations(
      'agent_email_confirmed',
      { username: 'User' },
    );

    expect(translations.length).toBeGreaterThan(0);
    expect(translations.some(t => t.languageCode === LanguageCode.al)).toBe(true);
  });
});