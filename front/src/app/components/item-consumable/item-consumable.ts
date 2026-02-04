import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Consumable } from '../../models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-consumable',
  imports: [],
  templateUrl: './item-consumable.html',
  styleUrl: './item-consumable.scss',
})
export class ItemConsumable {
  @Input() consumable!: Consumable;
  @Input() update: boolean = true;
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
    this.router.navigate(['/consumable', this.consumable.id]);
  }
}
