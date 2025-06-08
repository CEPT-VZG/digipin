import { Test, TestingModule } from '@nestjs/testing';
import { DigipinService } from './digipin.service';

describe('DigipinService', () => {
  let service: DigipinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DigipinService],
    }).compile();

    service = module.get<DigipinService>(DigipinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
