import { Controller, Post, Body } from '@nestjs/common';
import { DigipinService } from './digipin.service';
import { CreateDigipinDto } from './dto/create-digipin.dto';

@Controller('digipin')
export class DigipinController {
  constructor(private readonly digipinService: DigipinService) {}

  @Post('/encode')
  create(@Body() createDigipinDto: CreateDigipinDto) {
    return this.digipinService.create(createDigipinDto);
  }
}
