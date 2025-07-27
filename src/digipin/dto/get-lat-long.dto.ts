import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetLatLongDto {
    @ApiProperty({
        example: "K98-PK8-PK8P",
        description: 'DigiPin code',
    })
    @IsString()
    digipin: string;
}

export class GetLatLongResponse {
    success: boolean;
    latitude: number | null;
    longitude: number | null;
}
