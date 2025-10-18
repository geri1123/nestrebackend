// test/app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './../src/app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return health info', () => {
      const health = appController.health();
      expect(health).toHaveProperty('status', 'OK');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('uptime');
      expect(typeof health.uptime).toBe('number');
    });
  });
});
