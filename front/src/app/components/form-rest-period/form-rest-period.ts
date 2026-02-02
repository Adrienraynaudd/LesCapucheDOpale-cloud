import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdventurerRest, CreateAdventurerRestData, RestType } from '../../models/adventurer-availability';

@Component({
  selector: 'app-form-rest-period',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-rest-period.html',
  styleUrl: './form-rest-period.scss'
})
export class FormRestPeriod implements OnInit {
  @Input() adventurerId!: number;
  @Input() editingRest: AdventurerRest | null = null;
  
  @Output() submitForm = new EventEmitter<CreateAdventurerRestData>();
  @Output() cancel = new EventEmitter<void>();

  formData: CreateAdventurerRestData = {
    adventurerId: 0,
    startDate: '',
    endDate: '',
    reason: '',
    type: 'rest'
  };

  restTypes: { value: RestType; label: string }[] = [
    { value: 'rest', label: 'Repos' },
    { value: 'unavailable', label: 'Indisponibilité' },
    { value: 'mission_rest', label: 'Repos post-mission' }
  ];

  ngOnInit() {
    this.formData.adventurerId = this.adventurerId;
    
    if (this.editingRest) {
      this.formData = {
        adventurerId: this.editingRest.adventurerId,
        startDate: this.formatDateForInput(this.editingRest.startDate),
        endDate: this.formatDateForInput(this.editingRest.endDate),
        reason: this.editingRest.reason,
        type: this.editingRest.type
      };
    } else {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      this.formData.startDate = this.formatDateForInput(today.toISOString());
      this.formData.endDate = this.formatDateForInput(tomorrow.toISOString());
    }
  }

  formatDateForInput(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  }

  onSubmit() {
    if (!this.isValid()) return;

    const data: CreateAdventurerRestData = {
      adventurerId: this.adventurerId,
      startDate: new Date(this.formData.startDate).toISOString(),
      endDate: new Date(this.formData.endDate).toISOString(),
      reason: this.formData.reason.trim(),
      type: this.formData.type
    };

    this.submitForm.emit(data);
  }

  onCancel() {
    this.cancel.emit();
  }

  isValid(): boolean {
    return !!(
      this.formData.startDate &&
      this.formData.endDate &&
      this.formData.reason.trim() &&
      this.formData.type &&
      new Date(this.formData.startDate) < new Date(this.formData.endDate)
    );
  }

  get dateError(): string {
    if (this.formData.startDate && this.formData.endDate) {
      if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
        return 'La date de fin doit être après la date de début';
      }
    }
    return '';
  }
}
