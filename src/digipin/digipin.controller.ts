import { Controller, Post, Body } from '@nestjs/common';
import { DigipinService } from './digipin.service';
import { CreateDigipinDto } from './dto/create-digipin.dto';
import { DigipinResponse } from './dto/digipin-response';

@Controller('digipin')
export class DigipinController {
  constructor(private readonly digipinService: DigipinService) { }

  @Post('/encode')
  getDigipin(@Body() createDigipinDto: CreateDigipinDto): DigipinResponse {
    const digipin = this.digipinService.getDigiPin(createDigipinDto);

    if (digipin) return { success: true, digipin };
    else return { success: false, digipin: null };
  }
}
