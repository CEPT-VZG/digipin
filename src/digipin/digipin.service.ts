import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDigipinDto } from './dto/create-digipin.dto';
import { BOUNDS, DIGIPIN_GRID } from './constants';

@Injectable()
export class DigipinService {
  getDigiPin(createDigipinDto: CreateDigipinDto) {
    const { latitude: lat, longitude: lon } = createDigipinDto;

    if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat)
      throw new BadRequestException('Latitude out of range');
    if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon)
      throw new BadRequestException('Longitude out of range');

    let minLat = BOUNDS.minLat;
    let maxLat = BOUNDS.maxLat;
    let minLon = BOUNDS.minLon;
    let maxLon = BOUNDS.maxLon;

    let digiPin = '';

    for (let level = 1; level <= 10; level++) {
      const latDiv = (maxLat - minLat) / 4;
      const lonDiv = (maxLon - minLon) / 4;

      // REVERSED row logic (to match original)
      let row = 3 - Math.floor((lat - minLat) / latDiv);
      let col = Math.floor((lon - minLon) / lonDiv);

      row = Math.max(0, Math.min(row, 3));
      col = Math.max(0, Math.min(col, 3));

      digiPin += DIGIPIN_GRID[row][col];

      if (level === 3 || level === 6) digiPin += '-';

      // Update bounds (reverse logic for row)
      maxLat = minLat + latDiv * (4 - row);
      minLat = minLat + latDiv * (3 - row);

      minLon = minLon + lonDiv * col;
      maxLon = minLon + lonDiv;
    }

    return digiPin;
  }
}
