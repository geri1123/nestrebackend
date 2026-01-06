import { SocketConnectionService } from "../socket-connection.service";
describe('SocketConnectionService', () => {
  let service: SocketConnectionService;

  beforeEach(() => {
    service = new SocketConnectionService();
  });

  afterEach(() => {
    service.clearAll();
  });

  it('should add a connection for a user', () => {
    service.addConnection(1, 'socket-1');

    expect(service.getUserConnectionCount(1)).toBe(1);
    expect(service.isUserOnline(1)).toBe(true);
  });

  it('should support multiple sockets for one user', () => {
    service.addConnection(1, 'socket-1');
    service.addConnection(1, 'socket-2');

    expect(service.getUserConnectionCount(1)).toBe(2);
  });

  it('should remove socket and keep user online if others exist', () => {
    service.addConnection(1, 'socket-1');
    service.addConnection(1, 'socket-2');

    service.removeConnection(1, 'socket-1');

    expect(service.getUserConnectionCount(1)).toBe(1);
    expect(service.isUserOnline(1)).toBe(true);
  });

  it('should mark user offline when last socket disconnects', () => {
    service.addConnection(1, 'socket-1');

    service.removeConnection(1, 'socket-1');

    expect(service.isUserOnline(1)).toBe(false);
  });
});