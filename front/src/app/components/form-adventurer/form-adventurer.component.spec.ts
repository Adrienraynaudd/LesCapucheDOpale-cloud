import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormAdventurerComponent } from './form-adventurer.component';
import { SpecialityService } from '../../services/speciality/speciality.service';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';

describe('FormAdventurerComponent', () => {
  let component: FormAdventurerComponent;
  let fixture: ComponentFixture<FormAdventurerComponent>;

  // mock des services
  let specialtyServiceSpy: jasmine.SpyObj<SpecialityService>;
  let equipmentServiceSpy: jasmine.SpyObj<EquipmentService>;
  let consumableServiceSpy: jasmine.SpyObj<ConsumableService>;

  beforeEach(async () => {
    specialtyServiceSpy = jasmine.createSpyObj('SpecialityService', ['getSpecialties']);
    equipmentServiceSpy = jasmine.createSpyObj('EquipmentService', ['getEquipment']);
    consumableServiceSpy = jasmine.createSpyObj('ConsumableService', ['getConsumables']);

    specialtyServiceSpy.getSpecialties.and.returnValue(of([{ id: 1, name: 'Guerrier' }]));
    equipmentServiceSpy.getEquipment.and.returnValue(of([{ id: 10, name: 'Épée' }]));
    consumableServiceSpy.getConsumables.and.returnValue(of([{ id: 20, name: 'Potion' }]));

    await TestBed.configureTestingModule({
      imports: [FormAdventurerComponent],
      providers: [
        { provide: SpecialityService, useValue: specialtyServiceSpy },
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
    fixture.detectChanges(); // déclenche ngOnInit
    expect(specialtyServiceSpy.getSpecialties).toHaveBeenCalled();
    expect(equipmentServiceSpy.getEquipment).toHaveBeenCalled();
    expect(consumableServiceSpy.getConsumables).toHaveBeenCalled();

    expect((component as any).specialties.length).toBe(1);
    expect((component as any).equipmentTypes.length).toBe(1);
    expect((component as any).consumableTypes.length).toBe(1);
  });

  it('should patch initialData when provided', () => {
    component.initialData = {
      name: 'Aragorn',
      specialty: 1,
      equipmentType: [10],
      consumableType: [20],
      dailyRate: 345,
    };

    fixture.detectChanges(); // ngOnInit est appelé

    expect((component as any).adventurerForm.value.name).toBe('Aragorn');
    expect((component as any).adventurerForm.value.dailyRatePo).toBe(3);
    expect((component as any).adventurerForm.value.dailyRatePa).toBe(4);
    expect((component as any).adventurerForm.value.dailyRatePc).toBe(5);
  });

  it('should emit formSubmitted with correct data when form is valid', () => {
    fixture.detectChanges();

    const emitSpy = spyOn(component.formSubmitted, 'emit');

    (component as any).adventurerForm.setValue({
      name: 'Gandalf',
      specialty: 1,
      equipmentType: [10],
      consumableType: [20],
      dailyRatePo: 1,
      dailyRatePa: 2,
      dailyRatePc: 3,
    });

    (component as any).onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      name: 'Gandalf',
      specialty: 1,
      equipmentType: [10],
      consumableType: [20],
      dailyRate: 123,
    });
  });

  it('should not emit if form is invalid', () => {
    fixture.detectChanges();

    const emitSpy = spyOn(component.formSubmitted, 'emit');

    (component as any).adventurerForm.get('name')?.setValue(''); // invalide
    (component as any).onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should update daily rate correctly', () => {
    fixture.detectChanges();

    (component as any).adventurerForm.patchValue({
      dailyRatePo: 2,
      dailyRatePa: 25,
      dailyRatePc: 128,
    });

    (component as any).onDailyRateChange();

    const po = (component as any).adventurerForm.get('dailyRatePo')?.value;
    const pa = (component as any).adventurerForm.get('dailyRatePa')?.value;
    const pc = (component as any).adventurerForm.get('dailyRatePc')?.value;

    expect(po * 100 + pa * 10 + pc).toBe(578);
  });
});
