import { Test, TestingModule } from '@nestjs/testing';
import { DigipinController } from './digipin.controller';
import { DigipinService } from './digipin.service';

describe('DigipinController', () => {
  let controller: DigipinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigipinController],
      providers: [DigipinService],
    }).compile();

    controller = module.get<DigipinController>(DigipinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
