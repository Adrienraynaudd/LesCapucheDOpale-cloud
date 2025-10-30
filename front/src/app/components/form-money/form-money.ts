import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-money',
  imports: [ReactiveFormsModule],
  templateUrl: './form-money.html',
  styleUrl: './form-money.scss'
})
export class FormMoney implements OnChanges {
  @Input() label!: string;

  @Input() money!: number;
  @Output() moneyChange = new EventEmitter<number>();

  form = new FormGroup({
    po: new FormControl(0, [Validators.required, Validators.min(0)]),
    pa: new FormControl(0, [Validators.required, Validators.min(0)]),
    pc: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  ngOnChanges(change: SimpleChanges): void {
    if (change['money'] && change['money'].currentValue !== change['money'].previousValue) {
      this.form.get('pc')?.setValue(change['money'].currentValue % 10, { emitEvent: false });
      this.form.get('pa')?.setValue(Math.floor((change['money'].currentValue / 10)) % 10, { emitEvent: false });
      this.form.get('po')?.setValue(Math.floor(change['money'].currentValue / 100), { emitEvent: false });
    }
  }


  protected onChange(): void {
    const po = this.form.get('po')?.value ?? 0;
    const pa = this.form.get('pa')?.value ?? 0;
    const pc = this.form.get('pc')?.value ?? 0;
    this.money = Math.floor(po * 100 + pa * 10 + pc);
    this.form.get('pc')?.setValue(this.money % 10, { emitEvent: false });
    this.form.get('pa')?.setValue(Math.floor((this.money / 10)) % 10, { emitEvent: false });
    this.form.get('po')?.setValue(Math.floor(this.money / 100), { emitEvent: false });
    this.moneyChange.emit(this.money);
  }
}
