import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormQuest } from './form-quest';
import { QuestForm } from '../../models/quest';

describe('FormQuest', () => {
  let component: FormQuest;
  let fixture: ComponentFixture<FormQuest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormQuest]
    }).compileComponents();

    fixture = TestBed.createComponent(FormQuest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form by default', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should validate form when all fields are filled correctly', () => {
    component.form.setValue({
      name: 'Sauver le village',
      description: 'Protéger le village des gobelins',
      finalDate: '2025-12-01',
      estimatedDuration: 3,
      reward: 500,
    });

    expect(component.form.valid).toBeTrue();
  });

  it('should emit formSubmitted with correct data when form is valid', () => {
    const emitSpy = spyOn(component.formSubmitted, 'emit');

    const formValue: QuestForm = {
      name: 'Trouver la relique',
      description: 'Explorer le donjon et ramener la relique sacrée.',
      finalDate: '2025-11-15',
      estimatedDuration: 5,
      reward: 1000,
    };

    component.form.setValue(formValue);
    component['onSubmit']();

    expect(emitSpy).toHaveBeenCalledWith(formValue);
  });

  it('should not emit when form is invalid', () => {
    const emitSpy = spyOn(component.formSubmitted, 'emit');
    component.form.get('name')?.setValue(''); // champ requis vide
    component['onSubmit']();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should call markAllAsTouched when form invalid', () => {
    const markSpy = spyOn(component.form, 'markAllAsTouched');
    component['onSubmit']();
    expect(markSpy).toHaveBeenCalled();
  });

  it('should getMoney return current reward', () => {
    component.form.get('reward')?.setValue(750);
    expect(component['getMoney']()).toBe(750);
  });

  it('should getMoney return 0 if reward not set', () => {
    component.form.get('reward')?.setValue(null);
    expect(component['getMoney']()).toBe(0);
  });


  it('should set reward', () => {
    component['setMoney'](1200);
    expect(component.form.get('reward')?.value).toBe(1200);
  });

    describe('ngOnChanges', () => {
    it('should patch form values when initialData is provided', () => {
      const mockQuest: QuestForm = {
        name: 'Mission secrète',
        description: 'Infiltrer le château ennemi',
        finalDate: '2025-12-31T00:00:00',
        estimatedDuration: 7,
        reward: 2500,
      };

      const patchSpy = spyOn(component.form, 'patchValue').and.callThrough();

      component.initialData = mockQuest;
      component.ngOnChanges();

      expect(patchSpy).toHaveBeenCalledWith({
        name: 'Mission secrète',
        description: 'Infiltrer le château ennemi',
        finalDate: '2025-12-31',
        estimatedDuration: 7,
        reward: 2500,
      });

      expect(component.form.value).toEqual({
        name: 'Mission secrète',
        description: 'Infiltrer le château ennemi',
        finalDate: '2025-12-31',
        estimatedDuration: 7,
        reward: 2500,
      });
    });

    it('should not patch form when initialData is null', () => {
      const patchSpy = spyOn(component.form, 'patchValue');
      component.initialData = null;
      component.ngOnChanges();
      expect(patchSpy).not.toHaveBeenCalled();
    });

    it('should handle missing fields in initialData gracefully', () => {
      const partialData = {
        name: 'Incomplete Quest',
        description: '',
        finalDate: '2025-10-10T00:00:00'
      } as any;

      expect(() => {
        component.initialData = partialData;
        component.ngOnChanges();
      }).not.toThrow();
    });
  });
});
