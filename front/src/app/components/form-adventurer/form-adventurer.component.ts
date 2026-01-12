import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdventurerFormData, ConsumableType, EquipmentType, Speciality } from '../../models/models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { forkJoin } from 'rxjs';
import { SpecialityService } from '../../services/speciality/speciality.service';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { FormMoney } from '../form-money/form-money';

@Component({
    selector: 'app-form-adventurer',
    imports: [ReactiveFormsModule, FormMoney, MatFormFieldModule, MatSelectModule],
    templateUrl: './form-adventurer.component.html',
    styleUrl: './form-adventurer.component.scss'
})
export class FormAdventurerComponent implements OnInit, OnChanges {
  @Output() formSubmitted = new EventEmitter<AdventurerFormData>();
  @Input() initialData: AdventurerFormData | null = null;

  protected adventurerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    specialityId: new FormControl(0, [Validators.required]),
    equipmentTypeIds: new FormControl([] as number[], []),
    consumableTypeIds: new FormControl([] as number[], []),
    dailyRate: new FormControl(0, [Validators.required, Validators.min(0)]),
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
      equipment: this.equipmentService.getEquipmentType(),
      consumables: this.consumableService.getConsumableTypes()
    }).subscribe(({ specialities, equipment, consumables }) => {
      this.specialities = specialities;
      this.equipmentTypes = equipment;
      this.consumableTypes = consumables;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.adventurerForm.patchValue({
        name: this.initialData.name,
        specialityId: this.initialData.specialityId,
        equipmentTypeIds: this.initialData.equipmentTypeIds,
        consumableTypeIds: this.initialData.consumableTypeIds,
        dailyRate: this.initialData.dailyRate,
      });
    }
  }

  protected onSubmit(): void {
    this.hasSubmitted = true;
    if (this.adventurerForm.invalid) {
      return;
    }
    this.formSubmitted.emit(
      {
        name: this.adventurerForm.get('name')?.value ?? "",
        specialityId: +(this.adventurerForm.get('specialityId')?.value ?? 0),
        equipmentTypeIds: (this.adventurerForm.get('equipmentTypeIds')?.value ?? []).map((id: any) => +id),
        consumableTypeIds: (this.adventurerForm.get('consumableTypeIds')?.value ?? []).map((id: any) => +id),
        dailyRate: this.getMoney(),
      }
    );
  }

  protected getMoney(): number {
    return this.adventurerForm.get('dailyRate')?.value ?? 0;
  }

  protected setMoney(value: number): void {
    this.adventurerForm.get('dailyRate')?.setValue(value);
  }
}
