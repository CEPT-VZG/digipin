import { IsNumber, Min, Max } from 'class-validator';
import { BOUNDS } from '../constants';
import { Type } from 'class-transformer';

export class CreateDigipinDto {
  @IsNumber()
  @Min(BOUNDS.minLat)
  @Max(BOUNDS.maxLat)
  @Type(() => Number)
  latitude: number;

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
