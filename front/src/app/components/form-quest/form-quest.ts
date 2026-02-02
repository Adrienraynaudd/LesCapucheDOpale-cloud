import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormMoney } from '../form-money/form-money';
import { QuestForm } from '../../models/quest';

@Component({
  selector: 'app-form-quest',
  standalone: true,
  imports: [FormMoney, ReactiveFormsModule],
  templateUrl: './form-quest.html',
  styleUrls: ['./form-quest.scss']
})
export class FormQuest implements OnChanges {
  @Output() formSubmitted = new EventEmitter<QuestForm>();
  @Input() initialData: QuestForm | null = null;

  questForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required, Validators.minLength(50)]),
    finalDate: new FormControl('', [Validators.required]),
    estimatedDuration: new FormControl(1, [Validators.required, Validators.min(1)]),
    reward: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  protected hasSubmitted = false;

  ngOnChanges(): void {
    if (this.initialData) {
      this.questForm.patchValue({
        name: this.initialData.name,
        description: this.initialData.description,
        finalDate: this.initialData.finalDate.split('T')[0],
        estimatedDuration: this.initialData.estimatedDuration,
        reward: this.initialData.reward
      });
    }
  }

  protected getMoney(): number {
    return this.questForm.get('reward')?.value ?? 0;
  }

  protected setMoney(value: number): void {
    this.questForm.get('reward')?.setValue(value);
  }

  protected onSubmit(): void {
    this.hasSubmitted = true
    if (this.questForm.valid) {
      this.formSubmitted.emit(this.questForm.value as QuestForm);
    } else {
      this.questForm.markAllAsTouched();
    }
  }
}
