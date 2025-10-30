import { Component, OnInit } from '@angular/core';
import { AdventurerFormData } from '../../models/adventurer';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { ActivatedRoute } from '@angular/router';
import { FormAdventurerComponent } from '../../components/form-adventurer/form-adventurer.component';

@Component({
  selector: 'app-update-adventurer',
  imports: [FormAdventurerComponent],
  templateUrl: './update-adventurer.html',
  styleUrl: './update-adventurer.scss'
})
export class UpdateAdventurer implements OnInit {
  adventurer: AdventurerFormData | null = null;
  id: number = 0;

  constructor(
    private readonly adventurerService: AdventurerService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    const idStr = this.route.snapshot.paramMap.get('id');
    this.id = idStr ? Number(idStr) : -1;

    if (!idStr || !/^\d+$/.test(idStr) || this.id < 0 || isNaN(this.id)) {
      console.error('Invalid adventurer ID');
      return;
    }

    this.adventurerService.getAdventurerById(this.id).subscribe(adventurer => {
      this.adventurer = {
        name: adventurer.name,
        specialityId: adventurer.specialityId,
        equipmentTypeIds: adventurer.equipmentTypeIds,
        consumableTypeIds: adventurer.consumableTypeIds,
        dailyRate: adventurer.dailyRate
      };
    });
  }

  protected onFormSubmitted(data: AdventurerFormData): void {
    this.adventurerService.updateAdventurer(this.id, data).subscribe({
      next: (adventurer) => {
        console.log('Adventurer updated successfully:', adventurer);
      },
      error: (error) => {
        console.error('Error updating adventurer:', error);
      }
    });
  }
}
