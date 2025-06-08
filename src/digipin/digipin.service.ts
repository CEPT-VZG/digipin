import { Injectable } from '@nestjs/common';
import { CreateDigipinDto } from './dto/create-digipin.dto';

@Injectable()
export class DigipinService {
  create(createDigipinDto: CreateDigipinDto) {
    return { success: true, dto: createDigipinDto };
  }
}
