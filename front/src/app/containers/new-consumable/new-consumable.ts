import { Component } from '@angular/core';
import { ConsumableFormData } from '../../models/models';
import { Router } from '@angular/router';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { catchError, switchMap, tap, of } from 'rxjs';
import { FormConsumable } from '../../components/form-consumable/form-consumable';

@Component({
  selector: 'app-new-consumable',
  imports: [
    FormConsumable
  ],
  templateUrl: './new-consumable.html',
  styleUrl: './new-consumable.scss',
})
export class NewConsumable {
  constructor(
    private readonly consumableService: ConsumableService,
    private readonly router: Router
  ) { }

  protected onFormSubmitted(data: ConsumableFormData): void {
    const quantity = data.quantity;
    const consumableData = { ...data, quantity: 0 }; // éviter de muter l'objet original

    this.consumableService.createConsumable(consumableData).pipe(
      switchMap(consumable =>
        this.consumableService.purchaseConsumable(consumable.id, quantity).pipe(
          tap(() => this.router.navigate(['/consumables'])),
          catchError(error => {
            console.error('Error purchasing consumable:', error);
            alert('Consumable created, but error purchasing quantity. Please try to purchase it again.');
            this.router.navigate([`/consumables/${consumable.id}`]);
            return of(null);
          })
        )
      ),
      catchError(error => {
        console.error('Error creating consumable:', error);
        return of(null);
      })
    ).subscribe();
  }

}
