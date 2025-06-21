import { IsString } from 'class-validator';

export class GetLatLongDto {
    @IsString()
    digipin: string;
}

export class GetLatLongResponse {
    success: boolean;
    latitude: number | null;
    longitude: number | null;
}
