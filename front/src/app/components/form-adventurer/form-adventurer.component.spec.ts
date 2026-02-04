import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormAdventurerComponent } from './form-adventurer.component';
import { SpecialityService } from '../../services/speciality/speciality.service';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { Upload } from '../../services/upload/upload';

describe('FormAdventurerComponent', () => {
  let component: FormAdventurerComponent;
  let fixture: ComponentFixture<FormAdventurerComponent>;

  let specialityServiceSpy: jasmine.SpyObj<SpecialityService>;
  let equipmentServiceSpy: jasmine.SpyObj<EquipmentService>;
  let consumableServiceSpy: jasmine.SpyObj<ConsumableService>;
  let uploadSpy: jasmine.SpyObj<Upload>;

  beforeEach(async () => {
    specialityServiceSpy = jasmine.createSpyObj('SpecialityService', ['getSpecialities', 'addSpeciality']);
    equipmentServiceSpy = jasmine.createSpyObj('EquipmentService', ['getEquipmentType', 'addEquipmentType']);
    consumableServiceSpy = jasmine.createSpyObj('ConsumableService', ['getConsumableTypes', 'addConsumableType']);
    uploadSpy = jasmine.createSpyObj('Upload', ['postFileImage']);

    specialityServiceSpy.getSpecialities.and.returnValue(of([{ id: 1, name: 'Guerrier' }]));
    equipmentServiceSpy.getEquipmentType.and.returnValue(of([{ id: 10, name: 'Épée' }]));
    consumableServiceSpy.getConsumableTypes.and.returnValue(of([{ id: 20, name: 'Potion' }]));
    uploadSpy.postFileImage.and.returnValue(of({ url: 'http://example.com/image.png' }));

    await TestBed.configureTestingModule({
      imports: [FormAdventurerComponent],
      providers: [
        { provide: SpecialityService, useValue: specialityServiceSpy },
        { provide: EquipmentService, useValue: equipmentServiceSpy },
        { provide: ConsumableService, useValue: consumableServiceSpy },
        { provide: Upload, useValue: uploadSpy },
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
    expect(equipmentServiceSpy.getEquipmentType).toHaveBeenCalled();
    expect(consumableServiceSpy.getConsumableTypes).toHaveBeenCalled();

    expect((component as any).specialities).toEqual([{ id: 1, name: 'Guerrier' }]);
    expect((component as any).equipmentTypes).toEqual([{ id: 10, name: 'Épée' }]);
    expect((component as any).consumableTypes).toEqual([{ id: 20, name: 'Potion' }]);
  });

  it('should patch form with initialData', () => {
    component.initialData = {
      name: 'Aragorn',
      specialityId: 1,
      equipmentTypeIds: [10],
      consumableTypeIds: [20],
      dailyRate: 345,
    };

    fixture.detectChanges();
    (component as any).ngOnChanges({
      initialData: { currentValue: component.initialData, previousValue: null, firstChange: true, isFirstChange: () => true }
    });

    const form = (component as any).adventurerForm.value;
    expect(form.name).toBe('Aragorn');
    expect(form.specialityId).toBe(1);
    expect(form.equipmentTypeIds).toEqual([10]);
    expect(form.consumableTypeIds).toEqual([20]);
    expect(form.dailyRate).toBe(345);
  });

  it('should set dailyRate to 0 if not provided', () => {
    (component as any).adventurerForm = {
      get: (field: string) => null
    }

    const res = (component as any).getMoney();

    expect(res).toBe(0);
  });

  it('should emit formSubmitted with correct data when form is valid', () => {
    fixture.detectChanges();

    const emitSpy = spyOn(component.formSubmitted, 'emit');

    (component as any).adventurerForm.setValue({
      name: 'Gandalf',
      specialityId: 1,
      equipmentTypeIds: [10],
      consumableTypeIds: [20],
      dailyRate: 123,
    });

    (component as any).onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      name: 'Gandalf',
      specialityId: 1,
      equipmentTypeIds: [10],
      consumableTypeIds: [20],
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

  it('should set and get money correctly', () => {
    fixture.detectChanges();

    (component as any).setMoney(250);
    expect((component as any).getMoney()).toBe(250);
  });

  describe('addNewEquipmentType', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show error if name is empty', () => {
      (component as any).newEquipementTypeForm.get('name')?.setValue('');
      (component as any).addNewEquipmentType();

      expect((component as any).newEquipTypeError).toBe('Le nom du type est requis.');
      expect(equipmentServiceSpy.addEquipmentType).not.toHaveBeenCalled();
    });

    it('should show error if name is only whitespace', () => {
      (component as any).newEquipementTypeForm.get('name')?.setValue('   ');
      (component as any).addNewEquipmentType();

      expect((component as any).newEquipTypeError).toBe('Le nom du type est requis.');
    });

    it('should add new equipment type and update form', () => {
      equipmentServiceSpy.addEquipmentType.and.returnValue(of({ id: 99, name: 'Arc' }));
      (component as any).newEquipementTypeForm.get('name')?.setValue('Arc');
      (component as any).showTypePopupEquip = true;

      (component as any).addNewEquipmentType();

      expect(equipmentServiceSpy.addEquipmentType).toHaveBeenCalledWith('Arc');
      expect((component as any).equipmentTypes).toContain({ id: 99, name: 'Arc' });
      expect((component as any).adventurerForm.get('equipmentTypeIds')?.value).toContain(99);
      expect((component as any).showTypePopupEquip).toBeFalse();
      expect((component as any).newEquipementTypeForm.get('name')?.value).toBe('');
    });

    it('should show error on service failure', () => {
      equipmentServiceSpy.addEquipmentType.and.returnValue(throwError(() => ({ message: 'Server error' })));
      (component as any).newEquipementTypeForm.get('name')?.setValue('Test');

      (component as any).addNewEquipmentType();

      expect((component as any).newEquipTypeError).toBe('Erreur lors de l\'ajout du type : Server error');
    });
  });

  describe('cancelPopupEquip', () => {
    it('should reset popup state and form', () => {
      fixture.detectChanges();
      (component as any).showTypePopupEquip = true;
      (component as any).newEquipementTypeForm.get('name')?.setValue('Test');
      (component as any).newEquipTypeError = 'Some error';

      (component as any).cancelPopupEquip();

      expect((component as any).showTypePopupEquip).toBeFalse();
      expect((component as any).newEquipementTypeForm.get('name')?.value).toBe('');
      expect((component as any).newEquipTypeError).toBe('');
    });
  });

  describe('addNewConsumableType', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show error if name is empty', () => {
      (component as any).newConsumableTypeForm.get('name')?.setValue('');
      (component as any).addNewConsumableType();

      expect((component as any).newConsTypeError).toBe('Le nom du type est requis.');
      expect(consumableServiceSpy.addConsumableType).not.toHaveBeenCalled();
    });

    it('should add new consumable type and update form', () => {
      consumableServiceSpy.addConsumableType.and.returnValue(of({ id: 88, name: 'Élixir' }));
      (component as any).newConsumableTypeForm.get('name')?.setValue('Élixir');
      (component as any).showTypePopupCons = true;

      (component as any).addNewConsumableType();

      expect(consumableServiceSpy.addConsumableType).toHaveBeenCalledWith('Élixir');
      expect((component as any).consumableTypes).toContain({ id: 88, name: 'Élixir' });
      expect((component as any).adventurerForm.get('consumableTypeIds')?.value).toContain(88);
      expect((component as any).showTypePopupCons).toBeFalse();
      expect((component as any).newConsumableTypeForm.get('name')?.value).toBe('');
    });

    it('should show error on service failure', () => {
      consumableServiceSpy.addConsumableType.and.returnValue(throwError(() => ({ message: 'Server error' })));
      (component as any).newConsumableTypeForm.get('name')?.setValue('Test');

      (component as any).addNewConsumableType();

      expect((component as any).newConsTypeError).toBe('Erreur lors de l\'ajout du type : Server error');
    });
  });

  describe('cancelPopupCons', () => {
    it('should reset popup state and form', () => {
      fixture.detectChanges();
      (component as any).showTypePopupCons = true;
      (component as any).newConsumableTypeForm.get('name')?.setValue('Test');
      (component as any).newConsTypeError = 'Some error';

      (component as any).cancelPopupCons();

      expect((component as any).showTypePopupCons).toBeFalse();
      expect((component as any).newConsumableTypeForm.get('name')?.value).toBe('');
      expect((component as any).newConsTypeError).toBe('');
    });
  });

  describe('addNewSpeciality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show error if name is empty', () => {
      (component as any).newSpecialityForm.get('name')?.setValue('');
      (component as any).addNewSpeciality();

      expect((component as any).newSpeError).toBe('Le nom du type est requis.');
      expect(specialityServiceSpy.addSpeciality).not.toHaveBeenCalled();
    });

    it('should add new speciality and update form', () => {
      specialityServiceSpy.addSpeciality.and.returnValue(of({ id: 77, name: 'Mage' }));
      (component as any).newSpecialityForm.get('name')?.setValue('Mage');
      (component as any).showTypePopupSpe = true;

      (component as any).addNewSpeciality();

      expect(specialityServiceSpy.addSpeciality).toHaveBeenCalledWith('Mage');
      expect((component as any).specialities).toContain({ id: 77, name: 'Mage' });
      expect((component as any).adventurerForm.get('specialityId')?.value).toBe(77);
      expect((component as any).showTypePopupSpe).toBeFalse();
      expect((component as any).newSpecialityForm.get('name')?.value).toBe('');
    });

    it('should show error on service failure', () => {
      specialityServiceSpy.addSpeciality.and.returnValue(throwError(() => ({ message: 'Server error' })));
      (component as any).newSpecialityForm.get('name')?.setValue('Test');

      (component as any).addNewSpeciality();

      expect((component as any).newSpeError).toBe('Erreur lors de l\'ajout du type : Server error');
    });
  });

  describe('cancelPopupSpe', () => {
    it('should reset popup state and form', () => {
      fixture.detectChanges();
      (component as any).showTypePopupSpe = true;
      (component as any).newSpecialityForm.get('name')?.setValue('Test');
      (component as any).newSpeError = 'Some error';

      (component as any).cancelPopupSpe();

      expect((component as any).showTypePopupSpe).toBeFalse();
      expect((component as any).newSpecialityForm.get('name')?.value).toBe('');
      expect((component as any).newSpeError).toBe('');
    });
  });

  describe('uploadFileImage', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call upload.postFileImage with the file', () => {
      const mockFile = new File(['test content'], 'test-image.png', { type: 'image/png' });

      (component as any).uploadFileImage(mockFile);

      expect(uploadSpy.postFileImage).toHaveBeenCalledWith(mockFile);
    });

    it('should log success message on successful upload', () => {
      const mockFile = new File(['test content'], 'test-image.png', { type: 'image/png' });
      const mockResponse = { url: 'http://example.com/uploaded-image.png' };
      uploadSpy.postFileImage.and.returnValue(of(mockResponse));
      const consoleSpy = spyOn(console, 'log');

      (component as any).uploadFileImage(mockFile);

      expect(consoleSpy).toHaveBeenCalledWith('Fichier uploadé avec succès :', mockResponse);
    });

    it('should log error message on upload failure', () => {
      const mockFile = new File(['test content'], 'test-image.png', { type: 'image/png' });
      const mockError = { message: 'Upload failed' };
      uploadSpy.postFileImage.and.returnValue(throwError(() => mockError));
      const consoleErrorSpy = spyOn(console, 'error');

      (component as any).uploadFileImage(mockFile);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de l\'upload du fichier :', mockError);
    });
  });
});
