import { IsString } from 'class-validator';

export class UpdateSpecialtyDto {
    @IsString()
    name?: string;
}