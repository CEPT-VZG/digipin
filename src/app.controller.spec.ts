import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDto } from './app.dto';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return an instance of AppDto with expected values', () => {
      const result = appController.getHello();

      expect(result).toBeInstanceOf(AppDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'DIGIPIN API is running and API docs can be found at at /api/v1/api-docs',
      );
      expect(typeof result.timestamp).toBe('number');
    });
  });
});
