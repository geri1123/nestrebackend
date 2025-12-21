import { LanguageMiddleware } from './language.middleware';
import { Request, Response } from 'express';
import { requestContext } from '../common/context/request-context';

describe('LanguageMiddleware', () => {
  let middleware: LanguageMiddleware;

  beforeEach(() => {
    middleware = new LanguageMiddleware();
    jest.spyOn(requestContext, 'run').mockImplementation((_, cb) => cb());
  });

  function mockReq(overrides: Partial<Request> = {}) {
    return {
      headers: {},
      cookies: {},
      query: {},
      ...overrides,
    } as any;
  }

  function mockRes() {
    return { locals: {} } as Response;
  }

  it('uses x-lang header if valid', () => {
    const req = mockReq({ headers: { 'x-lang': 'en' } });
    const res = mockRes();
    const next = jest.fn();

    middleware.use(req as any, res, next);

    expect(req.language).toBe('en');
    expect(res.locals.lang).toBe('en');
    expect(next).toHaveBeenCalled();
  });

  it('falls back to cookie if header invalid', () => {
    const req = mockReq({
      headers: { 'x-lang': 'xx' },
      cookies: { NEXT_LOCALE: 'it' },
    });
    const res = mockRes();

    middleware.use(req as any, res, jest.fn());

    expect(req.language).toBe('it');
  });

  it('falls back to al if nothing valid', () => {
    const req = mockReq();
    const res = mockRes();

    middleware.use(req as any, res, jest.fn());

    expect(req.language).toBe('al');
  });
});