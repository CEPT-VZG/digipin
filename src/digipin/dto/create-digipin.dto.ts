import { IsNumber, Min, Max } from 'class-validator';
import { BOUNDS } from '../constants';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDigipinDto {
  @ApiProperty({
    example: 20,
    minimum: BOUNDS.minLat,
    maximum: BOUNDS.maxLat,
    description: 'Latitude of the digipin location',
  })
  @IsNumber()
  @Min(BOUNDS.minLat)
  @Max(BOUNDS.maxLat)
  @Type(() => Number)
  latitude: number;

  @ApiProperty({
    example: 70,
    minimum: BOUNDS.minLon,
    maximum: BOUNDS.maxLon,
    description: 'Longitude of the digipin location',
  })
  @IsNumber()
  @Min(BOUNDS.minLon)
  @Max(BOUNDS.maxLon)
  @Type(() => Number)
  longitude: number;
}

export class CreateDigipinResponse {
  success: boolean;
  digipin: string | null;
}
