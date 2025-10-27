import {IsString} from "class-validator";

export class SpecialtyDto {
    @IsString()
    name: string;
}
