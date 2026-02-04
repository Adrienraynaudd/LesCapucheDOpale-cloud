import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { Equipment } from '../../models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-equipment',
  imports: [],
  templateUrl: './item-equipment.html',
  styleUrl: './item-equipment.scss',
})
export class ItemEquipment {
  @Input() equipment!: Equipment;
  @Output() quantityChange = new EventEmitter<number>();
  @Input() isSelected: boolean = false;

  constructor(
    private readonly router: Router
  ){}

  onQuantityChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const quantity = parseInt(inputElement.value, 10);
    this.quantityChange.emit(quantity);
  }

  onUpdate(): void {
    this.router.navigate(['/equipment', this.equipment.id]);
  }
}
