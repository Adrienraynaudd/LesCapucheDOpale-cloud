import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentTypesController } from '../controllers/equipment-types.controller';
import { EquipmentTypesService } from '../services/equipment-types.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('EquipmentTypesController', () => {
    let controller: EquipmentTypesController;
    let service: EquipmentTypesService;

    const mockEquipmentTypesService = {
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
            controllers: [EquipmentTypesController],
            providers: [{ provide: EquipmentTypesService, useValue: mockEquipmentTypesService }],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .overrideGuard(RolesGuard)
            .useValue(mockRolesGuard)
            .compile();

        controller = module.get<EquipmentTypesController>(EquipmentTypesController);
        service = module.get<EquipmentTypesService>(EquipmentTypesService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should call service.create()', async () => {
        const dto = { name: 'Sword' };
        mockEquipmentTypesService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);

        expect(service.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ id: 1, ...dto });
    });

    it('should call service.findAll()', async () => {
        const types = [{ id: 1, name: 'Bow' }];
        mockEquipmentTypesService.findAll.mockResolvedValue(types);

        const result = await controller.findAll();

        expect(service.findAll).toHaveBeenCalled();
        expect(result).toEqual(types);
    });

    it('should call service.findOne()', async () => {
        const type = { id: 1, name: 'Sword' };
        mockEquipmentTypesService.findOne.mockResolvedValue(type);

        const result = await controller.findOne(1);

        expect(service.findOne).toHaveBeenCalledWith(1);
        expect(result).toEqual(type);
    });

    it('should call service.update()', async () => {
        const updated = { id: 1, name: 'Updated' };
        mockEquipmentTypesService.update.mockResolvedValue(updated);

        const result = await controller.update(1, { name: 'Updated' });

        expect(service.update).toHaveBeenCalledWith(1, { name: 'Updated' });
        expect(result).toEqual(updated);
    });

    it('should call service.remove()', async () => {
        const deleted = { id: 1 };
        mockEquipmentTypesService.remove.mockResolvedValue(deleted);

        const result = await controller.remove(1);

        expect(service.remove).toHaveBeenCalledWith(1);
        expect(result).toEqual(deleted);
    });
});
