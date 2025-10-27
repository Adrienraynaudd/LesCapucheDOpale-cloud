import { Test, TestingModule } from '@nestjs/testing';
import { ConsumableTypesController } from '../controllers/consumable-types.controller';
import { ConsumableTypesService } from '../services/consumable-types.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ConsumableTypesController', () => {
    let controller: ConsumableTypesController;
    let service: ConsumableTypesService;

    const mockConsumableTypesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockJwtAuthGuard = {
        canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = { id: 1, email: 'admin@mail.com', roleId: 1 };
            return true;
        },
    };

    const mockRolesGuard = {
        canActivate: () => true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ConsumableTypesController],
            providers: [{ provide: ConsumableTypesService, useValue: mockConsumableTypesService }],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .overrideGuard(RolesGuard)
            .useValue(mockRolesGuard)
            .compile();

        controller = module.get<ConsumableTypesController>(ConsumableTypesController);
        service = module.get<ConsumableTypesService>(ConsumableTypesService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should call service.create()', async () => {
        const dto = { name: 'Potion' };
        mockConsumableTypesService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);

        expect(service.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ id: 1, ...dto });
    });

    it('should call service.findAll()', async () => {
        const types = [{ id: 1, name: 'Elixir' }];
        mockConsumableTypesService.findAll.mockResolvedValue(types);

        const result = await controller.findAll();

        expect(service.findAll).toHaveBeenCalled();
        expect(result).toEqual(types);
    });

    it('should call service.findOne()', async () => {
        const type = { id: 1, name: 'Potion' };
        mockConsumableTypesService.findOne.mockResolvedValue(type);

        const result = await controller.findOne(1);

        expect(service.findOne).toHaveBeenCalledWith(1);
        expect(result).toEqual(type);
    });

    it('should call service.update()', async () => {
        const updated = { id: 1, name: 'Updated' };
        mockConsumableTypesService.update.mockResolvedValue(updated);

        const result = await controller.update(1, { name: 'Updated' });

        expect(service.update).toHaveBeenCalledWith(1, { name: 'Updated' });
        expect(result).toEqual(updated);
    });

    it('should call service.remove()', async () => {
        const deleted = { id: 1 };
        mockConsumableTypesService.remove.mockResolvedValue(deleted);

        const result = await controller.remove(1);

        expect(service.remove).toHaveBeenCalledWith(1);
        expect(result).toEqual(deleted);
    });
});
