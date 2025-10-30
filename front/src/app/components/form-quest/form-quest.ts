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

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required]),
    finalDate: new FormControl('', [Validators.required]),
    estimatedDuration: new FormControl(1, [Validators.required, Validators.min(1)]),
    reward: new FormControl(0, [Validators.required, Validators.min(0)])
  });

  ngOnChanges(): void {
    if (this.initialData) {
      this.form.patchValue({
        name: this.initialData.name,
        description: this.initialData.description,
        finalDate: this.initialData.finalDate.split('T')[0],
        estimatedDuration: this.initialData.estimatedDuration,
        reward: this.initialData.reward
      });
    }
  }

  protected getMoney(): number {
    return this.form.get('reward')?.value ?? 0;
  }

  protected setMoney(value: number): void {
    this.form.get('reward')?.setValue(value);
  }

  protected onSubmit(): void {
    if (this.form.valid) {
      this.formSubmitted.emit(this.form.value as QuestForm);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
