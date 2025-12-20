import { SocketAuthService } from "./socket-auth.service";

describe('SocketAuthService - extractToken', () => {
  it('should extract token from cookies', () => {
    const socket: any = {
      id: '1',
      handshake: {
        headers: {
          cookie: 'token=abc123',
        },
      },
    };

    const service = new SocketAuthService({} as any, {} as any);

    expect(service.extractToken(socket)).toBe('abc123');
  });
});