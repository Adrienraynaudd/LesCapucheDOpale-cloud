import { IsString } from 'class-validator';

export class UpdateSpecialityDto {
  @IsString()
  name?: string;
}
