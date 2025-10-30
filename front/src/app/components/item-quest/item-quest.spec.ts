import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemQuest } from './item-quest';
import { Quest } from '../../models/models';

describe('ItemQuest', () => {
  let component: ItemQuest;
  let fixture: ComponentFixture<ItemQuest>;

  beforeEach(async () => {
    const mockQuest: Quest = {
      id: 1,
      name: 'Defeat the Goblin King',
      description: 'A dangerous goblin threatens the village.',
      finalDate: '2025-12-10T14:30:00Z',
      recommendedXP: 500,
      reward: 150,
      statusId: 1,
      UserId: 1,
      status: { id: 1, name: 'Open' },
      estimatedDuration: 4
    };

    await TestBed.configureTestingModule({
      imports: [ItemQuest],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemQuest);
    component = fixture.componentInstance;
    component.quest = mockQuest;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return date without time from finalDate', () => {
    const quest: Quest = {
      id: 1,
      name: 'Defeat the Goblin King',
      description: 'A dangerous goblin threatens the village.',
      finalDate: '2025-12-10T14:30:00Z',
    } as Quest;

    component.quest = quest;
    const date = component.getFinalDate();

    expect(date).toBe('2025-12-10');
  });

  it('should handle missing finalDate gracefully', () => {
    component.quest = { id: 1, name: 'Test Quest', description: '...', finalDate: '' } as Quest;

    // Empêche les erreurs si finalDate est vide ou invalide
    expect(() => component.getFinalDate()).not.toThrow();
  });
});
