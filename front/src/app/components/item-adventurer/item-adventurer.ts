import { Component, Input } from '@angular/core';
import { Adventurer } from '../../models/adventurer';

@Component({
  selector: 'app-item-adventurer',
  imports: [],
  templateUrl: './item-adventurer.html',
  styleUrl: './item-adventurer.scss'
})
export class ItemAdventurer {
  @Input() adventurer!: Adventurer;
  @Input() isSelected: boolean = false;

  getEquipmentNames(adventurer: Adventurer): string {
    return adventurer.equipmentTypes?.map(e => e.name).join(', ') || 'Aucun';
  }

  getConsumableNames(adventurer: Adventurer): string {
    return adventurer.consumableTypes?.map(c => c.name).join(', ') || 'Aucun';
  }

}
