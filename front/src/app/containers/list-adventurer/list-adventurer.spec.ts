import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListAdventurer } from './list-adventurer';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Adventurer } from '../../models/adventurer';

describe('ListAdventurer', () => {
  let component: ListAdventurer;
  let fixture: ComponentFixture<ListAdventurer>;
  let adventurerServiceSpy: jasmine.SpyObj<AdventurerService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockAdventurers: Adventurer[] = [
    {
      id: 1,
      name: 'Aragorn',
      speciality: { id: 1, name: 'Guerrier' },
      equipmentType: [],
      consumableType: [],
      dailyRate: 500,
      experience: 100
    },
    {
      id: 2,
      name: 'Legolas',
      speciality: { id: 2, name: 'Archer' },
      equipmentType: [],
      consumableType: [],
      dailyRate: 600,
      experience: 200
    }
  ];

  beforeEach(async () => {
    // Création des spies
    adventurerServiceSpy = jasmine.createSpyObj('AdventurerService', ['getAll']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ListAdventurer],
      providers: [
        { provide: AdventurerService, useValue: adventurerServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListAdventurer);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load adventurers on init', () => {
    // Arrange
    adventurerServiceSpy.getAll.and.returnValue(of(mockAdventurers));

    // Act
    component.ngOnInit();

    // Assert
    expect(adventurerServiceSpy.getAll).toHaveBeenCalled();
    expect(component.adventurers.length).toBe(2);
    expect(component.adventurers).toEqual(mockAdventurers);
  });

  it('should navigate to adventurer detail on click', () => {
    // Act
    component.onAdventurerClick(1);

    // Assert
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/adventurer', 1]);
  });
});
