import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    const data = {
      success: true,
      message:
        'DIGIPIN API is running and API docs can be found at at /api/v1/api-docs',
      timestamp: Date.now(),
    };
    return data
  }
}
