import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdventurerFormData, ConsumableType, EquipmentType, Speciality } from '../../models/models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { forkJoin } from 'rxjs';
import { SpecialityService } from '../../services/speciality/speciality.service';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { Upload } from '../../services/upload/upload';
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
    imageUrl: new FormControl<string | null>(null),
  });
  protected newSpecialityForm = new FormGroup({
    name: new FormControl(''),
  })
  protected newEquipementTypeForm = new FormGroup({
    name: new FormControl(''),
  })
  protected newConsumableTypeForm = new FormGroup({
    name: new FormControl(''),
  })

  protected specialities: Speciality[] = [];
  protected equipmentTypes: EquipmentType[] = [];
  protected consumableTypes: ConsumableType[] = [];
  protected hasSubmitted = false;
  protected showTypePopupSpe = false;
  protected showTypePopupEquip = false;
  protected showTypePopupCons = false;
  protected newEquipTypeError = '';
  protected newConsTypeError = '';
  protected newSpeError = '';

  // Image upload
  protected imagePreviewUrl: string | null = null;
  protected imageUploading = false;
  protected imageUploadError = '';

  constructor(
    private readonly specialityService: SpecialityService,
    private readonly equipmentService: EquipmentService,
    private readonly consumableService: ConsumableService,
    public upload: Upload
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
        imageUrl: this.initialData.imageUrl || null,
      });
      if (this.initialData.imageUrl) {
        this.imagePreviewUrl = this.initialData.imageUrl;
      }
    }
  }

  protected onSubmit(): void {
    this.hasSubmitted = true;
    if (this.adventurerForm.invalid) {
      return;
    }
    const imageUrlValue = this.adventurerForm.get('imageUrl')?.value;
    const formData: AdventurerFormData = {
      name: this.adventurerForm.get('name')?.value ?? "",
      specialityId: +(this.adventurerForm.get('specialityId')?.value ?? 0),
      equipmentTypeIds: (this.adventurerForm.get('equipmentTypeIds')?.value ?? []).map((id: any) => +id),
      consumableTypeIds: (this.adventurerForm.get('consumableTypeIds')?.value ?? []).map((id: any) => +id),
      dailyRate: this.getMoney(),
    };
    // N'inclure imageUrl que si elle a une valeur
    if (imageUrlValue) {
      formData.imageUrl = imageUrlValue;
    }
    this.formSubmitted.emit(formData);
  }

  protected getMoney(): number {
    return this.adventurerForm.get('dailyRate')?.value ?? 0;
  }

  protected setMoney(value: number): void {
    this.adventurerForm.get('dailyRate')?.setValue(value);
  }

  addNewEquipmentType(): void {
    this.newEquipTypeError = '';

    if (!this.newEquipementTypeForm.get('name')?.value?.trim()) {
      this.newEquipTypeError = 'Le nom du type est requis.';
      return;
    }
    this.equipmentService.addEquipmentType(this.newEquipementTypeForm.get('name')?.value ?? '').subscribe({
      next: (createdType) => {
        this.equipmentTypes.push(createdType);
        this.adventurerForm.get('equipmentTypeIds')?.setValue(this.adventurerForm.get('equipmentTypeIds')?.value?.concat([createdType.id]) ?? [createdType.id]);
        this.showTypePopupEquip = false;
        this.newEquipementTypeForm.get('name')?.setValue('');
      },
      error: (err) => {
        this.newEquipTypeError = 'Erreur lors de l\'ajout du type : ' + err.message;
      }
    });
  }

  cancelPopupEquip(): void {
    this.showTypePopupEquip = false;
    this.newEquipementTypeForm.get('name')?.setValue('');
    this.newEquipTypeError = '';
  }

  addNewConsumableType(): void {
    this.newConsTypeError = '';

    if (!this.newConsumableTypeForm.get('name')?.value?.trim()) {
      this.newConsTypeError = 'Le nom du type est requis.';
      return;
    }
    this.consumableService.addConsumableType(this.newConsumableTypeForm.get('name')?.value ?? '').subscribe({
      next: (createdType) => {
        this.consumableTypes.push(createdType);
        this.adventurerForm.get('consumableTypeIds')?.setValue(this.adventurerForm.get('consumableTypeIds')?.value?.concat([createdType.id]) ?? [createdType.id]);
        this.showTypePopupCons = false;
        this.newConsumableTypeForm.get('name')?.setValue('');
      },
      error: (err) => {
        this.newConsTypeError = 'Erreur lors de l\'ajout du type : ' + err.message;
      }
    });
  }

  cancelPopupCons(): void {
    this.showTypePopupCons = false;
    this.newConsumableTypeForm.get('name')?.setValue('');
    this.newConsTypeError = '';
  }

  addNewSpeciality(): void {
    this.newSpeError = '';

    if (!this.newSpecialityForm.get('name')?.value?.trim()) {
      this.newSpeError = 'Le nom du type est requis.';
      return;
    }
    this.specialityService.addSpeciality(this.newSpecialityForm.get('name')?.value ?? '').subscribe({
      next: (createdSpe) => {
        this.specialities.push(createdSpe);
        this.adventurerForm.get('specialityId')?.setValue(createdSpe.id);
        this.showTypePopupSpe = false;
        this.newSpecialityForm.get('name')?.setValue('');
      },
      error: (err) => {
        this.newSpeError = 'Erreur lors de l\'ajout du type : ' + err.message;
      }
    });
  }

  cancelPopupSpe(): void {
    this.showTypePopupSpe = false;
    this.newSpecialityForm.get('name')?.setValue('');
    this.newSpeError = '';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.imageUploadError = 'Format non supporté. Utilisez JPG, PNG, GIF ou WEBP.';
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.imageUploadError = 'L\'image est trop grande. Maximum 5MB.';
      return;
    }

    this.imageUploadError = '';
    this.imageUploading = true;

    // Créer un aperçu local
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Upload vers Azure
    this.upload.postFileImage(file).subscribe({
      next: (response) => {
        this.imageUploading = false;
        if (response && response.url) {
          this.adventurerForm.get('imageUrl')?.setValue(response.url);
        }
      },
      error: (error) => {
        this.imageUploading = false;
        this.imageUploadError = 'Erreur lors de l\'upload de l\'image.';
        console.error('Erreur upload:', error);
      }
    });
  }

  removeImage(): void {
    this.imagePreviewUrl = null;
    this.adventurerForm.get('imageUrl')?.setValue(null);
    this.imageUploadError = '';
  }

  getImageFileName(): string {
    const imageUrl = this.adventurerForm.get('imageUrl')?.value;
    if (!imageUrl) return '';
    try {
      const url = new URL(imageUrl);
      const pathname = url.pathname;
      return pathname.split('/').pop() || 'image';
    } catch {
      return 'image';
    }
  }

}
