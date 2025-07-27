import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { DigipinService } from './digipin.service';
import { CreateDigipinDto } from './dto/create-digipin.dto';
import { CreateDigipinResponse } from './dto/create-digipin.dto';
import { GetLatLongDto, GetLatLongResponse } from './dto/get-lat-long.dto';

@Controller('digipin')
export class DigipinController {
  constructor(private readonly digipinService: DigipinService) { }

  @Post('/encode')
  getDigipin(
    @Body() createDigipinDto: CreateDigipinDto,
  ): CreateDigipinResponse {
    const digipin = this.digipinService.getDigiPin(createDigipinDto);

    if (digipin) return { success: true, digipin };
    else return { success: false, digipin: null };
  }

  @Post('/decode')
  getLatLngFromDigiPin(
    @Body() getLatLongDto: GetLatLongDto,
  ): GetLatLongResponse {
    const { latitude, longitude } =
      this.digipinService.getLatLngFromDigiPin(getLatLongDto);

    if (latitude && longitude) return { success: true, latitude, longitude };
    else return { success: false, latitude: null, longitude: null };
  }

  @Get('/encode')
  getDigipinQuery(
    @Query() createDigipinDto: CreateDigipinDto,
  ): CreateDigipinResponse {
    const digipin = this.digipinService.getDigiPin(createDigipinDto);
    if (digipin) return { success: true, digipin };
    else return { success: false, digipin: null };
  }

  @Get('/decode')
  getLatLngFromDigiPinQuery(
    @Query() getLatLongDto: GetLatLongDto,
  ): GetLatLongResponse {
    const { latitude, longitude } =
      this.digipinService.getLatLngFromDigiPin(getLatLongDto);
    if (latitude && longitude) return { success: true, latitude, longitude };
    else return { success: false, latitude: null, longitude: null };
  }
}
