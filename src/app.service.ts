import { Injectable } from '@nestjs/common';
import { AppDto } from './app.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AppService {
  getHello(): AppDto {
    const data = {
      success: true,
      message:
        'DIGIPIN API is running and API docs can be found at at /api/v1/api-docs',
      timestamp: Date.now(),
    };
    return plainToInstance(AppDto, data);
  }
}
