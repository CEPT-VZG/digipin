import { Module } from '@nestjs/common';
import { DigipinService } from './digipin.service';
import { DigipinController } from './digipin.controller';

@Module({
  controllers: [DigipinController],
  providers: [DigipinService],
})
export class DigipinModule { }
