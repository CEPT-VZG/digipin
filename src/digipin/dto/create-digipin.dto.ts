import { IsNumber, Min, Max } from 'class-validator';
import { BOUNDS } from '../constants';

export class CreateDigipinDto {
  @IsNumber()
  @Min(BOUNDS.minLat)
  @Max(BOUNDS.maxLat)
  latitude: number;

  @IsNumber()
  @Min(BOUNDS.minLon)
  @Max(BOUNDS.maxLon)
  longitude: number;
}
