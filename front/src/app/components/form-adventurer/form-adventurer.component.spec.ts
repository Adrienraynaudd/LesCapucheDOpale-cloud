import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormAdventurerComponent } from './form-adventurer.component';
import { SpecialityService } from '../../services/speciality/speciality.service';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';

describe('FormAdventurerComponent', () => {
  let component: FormAdventurerComponent;
  let fixture: ComponentFixture<FormAdventurerComponent>;

  let specialityServiceSpy: jasmine.SpyObj<SpecialityService>;
  let equipmentServiceSpy: jasmine.SpyObj<EquipmentService>;
  let consumableServiceSpy: jasmine.SpyObj<ConsumableService>;

  beforeEach(async () => {
    specialityServiceSpy = jasmine.createSpyObj('SpecialityService', ['getSpecialities']);
    equipmentServiceSpy = jasmine.createSpyObj('EquipmentService', ['getEquipment']);
    consumableServiceSpy = jasmine.createSpyObj('ConsumableService', ['getConsumables']);

    specialityServiceSpy.getSpecialities.and.returnValue(of([{ id: 1, name: 'Guerrier' }]));
    equipmentServiceSpy.getEquipment.and.returnValue(of([{ id: 10, name: 'Épée' }]));
    consumableServiceSpy.getConsumables.and.returnValue(of([{ id: 20, name: 'Potion' }]));

    await TestBed.configureTestingModule({
      imports: [FormAdventurerComponent],
      providers: [
        { provide: SpecialityService, useValue: specialityServiceSpy },
        { provide: EquipmentService, useValue: equipmentServiceSpy },
        { provide: ConsumableService, useValue: consumableServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormAdventurerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load data from services on init', () => {
    fixture.detectChanges();

    expect(specialityServiceSpy.getSpecialities).toHaveBeenCalled();
    expect(equipmentServiceSpy.getEquipment).toHaveBeenCalled();
    expect(consumableServiceSpy.getConsumables).toHaveBeenCalled();

    expect((component as any).specialities).toEqual([{ id: 1, name: 'Guerrier' }]);
    expect((component as any).equipmentTypes).toEqual([{ id: 10, name: 'Épée' }]);
    expect((component as any).consumableTypes).toEqual([{ id: 20, name: 'Potion' }]);
  });

  it('should patch form with initialData', () => {
    component.initialData = {
      name: 'Aragorn',
      speciality: 1,
      equipmentType: [10],
      consumableType: [20],
      dailyRate: 345,
    };

    fixture.detectChanges();

    const form = (component as any).adventurerForm.value;
    expect(form.name).toBe('Aragorn');
    expect(form.dailyRatePo).toBe(3);
    expect(form.dailyRatePa).toBe(4);
    expect(form.dailyRatePc).toBe(5);
  });

  it('should patch form with initialData with no dailyRate', () => {
    component.initialData = {
      name: 'Aragorn',
      speciality: 1,
      equipmentType: [10],
      consumableType: [20],
    } as any;

    fixture.detectChanges();

    const form = (component as any).adventurerForm.value;
    expect(form.name).toBe('Aragorn');
    expect(form.dailyRatePo).toBe(0);
    expect(form.dailyRatePa).toBe(0);
    expect(form.dailyRatePc).toBe(0);
  });

  it('should emit formSubmitted with correct data when form is valid', () => {
    fixture.detectChanges();

    const emitSpy = spyOn(component.formSubmitted, 'emit');

    (component as any).adventurerForm.setValue({
      name: 'Gandalf',
      speciality: 1,
      equipmentType: [10],
      consumableType: [20],
      dailyRatePo: 1,
      dailyRatePa: 2,
      dailyRatePc: 3,
    });

    (component as any).onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      name: 'Gandalf',
      speciality: 1,
      equipmentType: [10],
      consumableType: [20],
      dailyRate: 123,
    });
  });

  it('should not emit when form is invalid', () => {
    fixture.detectChanges();

    const emitSpy = spyOn(component.formSubmitted, 'emit');
    (component as any).adventurerForm.get('name')?.setValue(''); // champ requis vide
    (component as any).onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should recalculate daily rate correctly in onDailyRateChange', () => {
    fixture.detectChanges();

    const form = (component as any).adventurerForm;
    form.patchValue({
      dailyRatePo: 2,
      dailyRatePa: 5,
      dailyRatePc: 8,
    });

    (component as any).onDailyRateChange();

    const po = form.get('dailyRatePo')?.value;
    const pa = form.get('dailyRatePa')?.value;
    const pc = form.get('dailyRatePc')?.value;
    const total = po * 100 + pa * 10 + pc;

    expect(total).toBe(258);
  });

  it('should handle edge cases in onDailyRateChange with undefined values', () => {
    fixture.detectChanges();

    const form = (component as any).adventurerForm;
    form.patchValue({
      dailyRatePo: undefined,
      dailyRatePa: undefined,
      dailyRatePc: undefined,
    });

    (component as any).onDailyRateChange();

    const total = (form.get('dailyRatePo')?.value ?? 0) * 100 +
                  (form.get('dailyRatePa')?.value ?? 0) * 10 +
                  (form.get('dailyRatePc')?.value ?? 0);

    expect(total).toBe(0); // valeurs par défaut sécurisées
  });

  it('should submit form with default data when no initialData is provided', () => {
    fixture.detectChanges();
    const emitSpy = spyOn(component.formSubmitted, 'emit');
    (component as any).adventurerForm = {
      invalid: false,
      get: (field: string) => null,
    };

    (component as any).onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      name: '',
      speciality: 0,
      equipmentType: [],
      consumableType: [],
      dailyRate: 0,
    });
  });
});
