import { Component } from '@angular/core';
import { FormAdventurerComponent } from '../../components/form-adventurer/form-adventurer.component';
import { AdventurerFormData } from '../../models/models';
import { AdventurerService } from '../../services/adventurer/adventurer.service';

@Component({
    selector: 'app-new-adventurer',
    imports: [
        FormAdventurerComponent
    ],
    templateUrl: './new-adventurer.component.html',
    styleUrl: './new-adventurer.component.scss'
})
export class NewAdventurerComponent {
  constructor(private readonly adventurerService: AdventurerService) { }

  protected onFormSubmitted(data: AdventurerFormData): void {
    this.adventurerService.createAdventurer(data).subscribe({
      next: (adventurer) => {
        console.log('Adventurer created successfully:', adventurer);
      },
      error: (error) => {
        console.error('Error creating adventurer:', error);
      }
    });
  }
}
