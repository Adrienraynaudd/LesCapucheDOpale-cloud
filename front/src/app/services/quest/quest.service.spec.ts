import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QuestService } from './quest.service';
import { Quest, QuestForm } from '../../models/models';
import { provideHttpClient } from '@angular/common/http';

describe('QuestService', () => {
  let service: QuestService;
  let httpMock: HttpTestingController;

  const mockQuests: Quest[] = [
    { id: 1, name: 'Retrieve the Artifact', description: 'Find the lost relic in the ruins.', finalDate: '2023-12-31', estimatedDuration: 5, reward: 1000, statusId: 1, recommendedXP: 500, UserId: 1, status: { id: 1, name: 'Open' } },
    { id: 2, name: 'Defend the Village', description: 'Protect the villagers from goblin attacks.', finalDate: '2023-12-31', estimatedDuration: 5, reward: 1000, statusId: 1, recommendedXP: 500, UserId: 1, status: { id: 1, name: 'Open' } },
  ];

  const mockQuest: Quest = { id: 1, name: 'Retrieve the Artifact', description: 'Find the lost relic in the ruins.', finalDate: '2023-12-31', estimatedDuration: 5, reward: 1000, statusId: 1, recommendedXP: 500, UserId: 1, status: { id: 1, name: 'Open' } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(QuestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'aucune requête HTTP n’est restée en attente
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all quests', () => {
    service.getAllQuests().subscribe((quests) => {
      expect(quests).toEqual(mockQuests);
      expect(quests.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/quests');
    expect(req.request.method).toBe('GET');
    req.flush(mockQuests);
  });

  it('should get quest by id', () => {
    const id = 1;

    service.getQuestById(id).subscribe((quest) => {
      expect(quest).toEqual(mockQuest);
    });

    const req = httpMock.expectOne(`/api/quests/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockQuest);
  });

  it('should create a new quest', () => {
    const newQuest: QuestForm = {
      name: 'Slay the Dragon',
      description: 'Defeat the dragon terrorizing the kingdom.',
      finalDate: '2025-12-01',
      estimatedDuration: 10,
      reward: 5000,
    };

    service.createQuest(newQuest).subscribe();

    const req = httpMock.expectOne('/api/quests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newQuest);
    req.flush({ id: 3, ...newQuest });
  });

  it('should update an existing quest', () => {
    const id = 1;
    const updatedQuest: QuestForm = {
      name: 'Retrieve the Artifact (Updated)',
      description: 'Return the relic to the temple.',
      finalDate: '2025-11-30',
      estimatedDuration: 7,
      reward: 2000,
    };

    service.updateQuest(id, updatedQuest).subscribe();

    const req = httpMock.expectOne(`/api/quests/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(updatedQuest);
    req.flush({ id, ...updatedQuest });
  });
});
