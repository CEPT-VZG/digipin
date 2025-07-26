import { Injectable } from '@nestjs/common';
import { API_PREFIX, APP_NAME } from './constants';

@Injectable()
export class AppService {
  getHello() {
    const data = {
      success: true,
      message: `${APP_NAME} API is running and API docs can be found at ${API_PREFIX}/api-docs`,
      timestamp: Date.now(),
    };
    return data;
  }
}
