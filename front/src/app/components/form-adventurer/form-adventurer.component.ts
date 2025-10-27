import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdventurerFormData, ConsumableType, EquipmentType, Speciality } from '../../models/models';

import { forkJoin } from 'rxjs';
import { SpecialityService } from '../../services/speciality/speciality.service';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';

@Component({
    selector: 'app-form-adventurer',
    imports: [ReactiveFormsModule],
    templateUrl: './form-adventurer.component.html',
    styleUrl: './form-adventurer.component.scss'
})
export class FormAdventurerComponent implements OnInit {
  @Output() formSubmitted = new EventEmitter<AdventurerFormData>();
  @Input() initialData: AdventurerFormData | null = null;

  protected adventurerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    speciality: new FormControl(0, [Validators.required]),
    equipmentType: new FormControl([] as number[], []),
    consumableType: new FormControl([] as number[], []),
    dailyRatePo: new FormControl(0, [Validators.required, Validators.min(0)]),
    dailyRatePa: new FormControl(0, [Validators.required, Validators.min(0)]),
    dailyRatePc: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  protected specialities: Speciality[] = [];
  protected equipmentTypes: EquipmentType[] = [];
  protected consumableTypes: ConsumableType[] = [];
  protected hasSubmitted = false;

  constructor(
    private readonly specialityService: SpecialityService,
    private readonly equipmentService: EquipmentService,
    private readonly consumableService: ConsumableService
  ) { }

  ngOnInit(): void {
    forkJoin({
      specialities: this.specialityService.getSpecialities(),
      equipment: this.equipmentService.getEquipment(),
      consumables: this.consumableService.getConsumables()
    }).subscribe(({ specialities, equipment, consumables }) => {
      this.specialities = specialities;
      this.equipmentTypes = equipment;
      this.consumableTypes = consumables;
    });

    if (this.initialData) {
      this.adventurerForm.patchValue({
        name: this.initialData.name,
        speciality: this.initialData.speciality,
        equipmentType: this.initialData.equipmentType,
        consumableType: this.initialData.consumableType,
        dailyRatePo: Math.floor((this.initialData.dailyRate || 0) / 100),
        dailyRatePa: Math.floor((this.initialData.dailyRate || 0) / 10) % 10,
        dailyRatePc: Math.floor(this.initialData.dailyRate || 0) % 10,
      });
    }
  }

  protected onDailyRateChange(): void {
    const po = this.adventurerForm.get('dailyRatePo')?.value ?? 0;
    const pa = this.adventurerForm.get('dailyRatePa')?.value ?? 0;
    const pc = this.adventurerForm.get('dailyRatePc')?.value ?? 0;
    const totalDailyRate = po * 100 + pa * 10 + pc;
    this.adventurerForm.get('dailyRatePc')?.setValue(totalDailyRate % 10, { emitEvent: false });
    this.adventurerForm.get('dailyRatePa')?.setValue(Math.floor((totalDailyRate / 10) % 10), { emitEvent: false });
    this.adventurerForm.get('dailyRatePo')?.setValue(Math.floor(totalDailyRate / 100), { emitEvent: false });
  }

  protected onSubmit(): void {
    this.hasSubmitted = true;
    if (this.adventurerForm.invalid) {
      return;
    }
    this.formSubmitted.emit(
      {
        name: this.adventurerForm.get('name')?.value ?? '',
        speciality: +(this.adventurerForm.get('speciality')?.value ?? 0),
        equipmentType: this.adventurerForm.get('equipmentType')?.value ?? [],
        consumableType: this.adventurerForm.get('consumableType')?.value ?? [],
        dailyRate: (this.adventurerForm.get('dailyRatePo')?.value ?? 0) * 100 +
                   (this.adventurerForm.get('dailyRatePa')?.value ?? 0) * 10 +
                   (this.adventurerForm.get('dailyRatePc')?.value ?? 0),
      }
    );
  }
}
