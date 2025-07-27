import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDigipinDto } from './dto/create-digipin.dto';
import { BOUNDS, DIGIPIN_GRID, DIGIPIN_LENGTH } from './constants';
import { GetLatLongDto } from './dto/get-lat-long.dto';

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

  getLatLngFromDigiPin(getLatLongDto: GetLatLongDto) {
    const { digipin } = getLatLongDto;
    const pin = digipin.replace(/-/g, '');
    if (pin.length !== DIGIPIN_LENGTH)
      throw new BadRequestException('Invalid DIGIPIN');

    let minLat = BOUNDS.minLat;
    let maxLat = BOUNDS.maxLat;
    let minLon = BOUNDS.minLon;
    let maxLon = BOUNDS.maxLon;

    for (let i = 0; i < 10; i++) {
      const char = pin[i];
      let found = false;
      let ri = -1,
        ci = -1;

      // Locate character in DIGIPIN grid
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (DIGIPIN_GRID[r][c] === char) {
            ri = r;
            ci = c;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) throw new NotFoundException('DIGIPIN not found');

      const latDiv = (maxLat - minLat) / 4;
      const lonDiv = (maxLon - minLon) / 4;

      const lat1 = maxLat - latDiv * (ri + 1);
      const lat2 = maxLat - latDiv * ri;
      const lon1 = minLon + lonDiv * ci;
      const lon2 = minLon + lonDiv * (ci + 1);

      // Update bounding box for next level
      minLat = lat1;
      maxLat = lat2;
      minLon = lon1;
      maxLon = lon2;
    }

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;


    return {
      latitude: +centerLat.toFixed(6),
      longitude: +centerLon.toFixed(6),
    };
  }
}
