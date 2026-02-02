import { Component, Input } from '@angular/core';
import { StockEquipment } from '../../models/models';

@Component({
  selector: 'app-item-stock-equipment',
  imports: [],
  templateUrl: './item-stock-equipment.html',
  styleUrl: './item-stock-equipment.scss',
})
export class ItemStockEquipment{
  @Input() equipment!: StockEquipment;
  @Input() isSelected: boolean = false;
}
