import { IsString } from 'class-validator';

export class SpecialityDto {
  @IsString()
  name: string;
}
