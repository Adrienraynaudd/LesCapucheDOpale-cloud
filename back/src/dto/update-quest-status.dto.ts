import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";

class UpdateStatusDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statusId?: number;

  @IsOptional()
  @IsString()
  statusName?: string;
}
export { UpdateStatusDto };