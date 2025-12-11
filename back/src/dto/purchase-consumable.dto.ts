import { IsInt } from 'class-validator';

export class PurchaseConsumableDto {
  @IsInt()
  quantity!: number;
}
