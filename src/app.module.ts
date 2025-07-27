import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DigipinModule } from './digipin/digipin.module';

@Module({
  imports: [DigipinModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
