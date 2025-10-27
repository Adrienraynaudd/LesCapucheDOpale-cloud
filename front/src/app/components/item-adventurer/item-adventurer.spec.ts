import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemAdventurer } from './item-adventurer';
import { Adventurer } from '../../models/adventurer';

describe('ItemAdventurer', () => {
  let component: ItemAdventurer;
  let fixture: ComponentFixture<ItemAdventurer>;

  const mockAdventurer: Adventurer = {
    id: 1,
    name: 'Aragorn',
    speciality: { id: 1, name: 'Guerrier' },
    equipmentType: [],
    consumableType: [],
    dailyRate: 123,
    experience: 0
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemAdventurer]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemAdventurer);
    component = fixture.componentInstance;
    component.adventurer = mockAdventurer;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getEquipmentNames', () => {
    it('should return "Aucun" when equipmentType is empty', () => {
      const result = component.getEquipmentNames(mockAdventurer);
      expect(result).toBe('Aucun');
    });

    it('should return a comma-separated list of equipment names', () => {
      const adventurerWithEquipments: Adventurer = {
        ...mockAdventurer,
        equipmentType: [
          { id: 1, name: 'Épée' },
          { id: 2, name: 'Bouclier' }
        ]
      };

      const result = component.getEquipmentNames(adventurerWithEquipments);
      expect(result).toBe('Épée, Bouclier');
    });

    it('should handle undefined equipmentType gracefully', () => {
      const adventurerWithoutEquipments = { ...mockAdventurer, equipmentType: undefined as any };
      const result = component.getEquipmentNames(adventurerWithoutEquipments);
      expect(result).toBe('Aucun');
    });
  });

  describe('getConsumableNames', () => {
    it('should return "Aucun" when consumableType is empty', () => {
      const result = component.getConsumableNames(mockAdventurer);
      expect(result).toBe('Aucun');
    });

    it('should return a comma-separated list of consumable names', () => {
      const adventurerWithConsumables: Adventurer = {
        ...mockAdventurer,
        consumableType: [
          { id: 1, name: 'Potion de soin' },
          { id: 2, name: 'Ration de voyage' }
        ]
      };

      const result = component.getConsumableNames(adventurerWithConsumables);
      expect(result).toBe('Potion de soin, Ration de voyage');
    });

    it('should handle undefined consumableType gracefully', () => {
      const adventurerWithoutConsumables = { ...mockAdventurer, consumableType: undefined as any };
      const result = component.getConsumableNames(adventurerWithoutConsumables);
      expect(result).toBe('Aucun');
    });
  });
});
