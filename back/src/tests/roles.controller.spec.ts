import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../controllers/roles.controller';
import { RolesService } from '../services/roles.service';

// On crée un Mock pour le RolesService
const mockRolesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of roles', async () => {
      const result = [{ id: 1, name: 'Admin' }];
      
      // On simule le retour du service
      (service.findAll as jest.Mock).mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single role', async () => {
      const result = { id: 1, name: 'Admin' };
      const idStr = '1'; // Le contrôleur reçoit une string via l'URL
      
      (service.findOne as jest.Mock).mockResolvedValue(result);

      expect(await controller.findOne(idStr)).toBe(result);
      
      // Important : on vérifie que le contrôleur a bien converti "1" en 1
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});