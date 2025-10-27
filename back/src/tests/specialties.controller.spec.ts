import { Test, TestingModule } from '@nestjs/testing';
import { SpecialtiesController } from '../controllers/specialties.controller';
import { SpecialtiesService } from '../services/specialties.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('SpecialtiesController', () => {
    let controller: SpecialtiesController;
    let service: SpecialtiesService;

    const mockSpecialtiesService = {
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
            controllers: [SpecialtiesController],
            providers: [{ provide: SpecialtiesService, useValue: mockSpecialtiesService }],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .overrideGuard(RolesGuard)
            .useValue(mockRolesGuard)
            .compile();

        controller = module.get<SpecialtiesController>(SpecialtiesController);
        service = module.get<SpecialtiesService>(SpecialtiesService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should call service.create()', async () => {
        const dto = { name: 'Warrior' };
        mockSpecialtiesService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);

        expect(service.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ id: 1, ...dto });
    });

    it('should call service.findAll()', async () => {
        const specialties = [{ id: 1, name: 'Mage' }];
        mockSpecialtiesService.findAll.mockResolvedValue(specialties);

        const result = await controller.findAll();

        expect(service.findAll).toHaveBeenCalled();
        expect(result).toEqual(specialties);
    });

    it('should call service.findOne()', async () => {
        const specialty = { id: 1, name: 'Warrior' };
        mockSpecialtiesService.findOne.mockResolvedValue(specialty);

        const result = await controller.findOne(1);

        expect(service.findOne).toHaveBeenCalledWith(1);
        expect(result).toEqual(specialty);
    });

    it('should call service.update()', async () => {
        const updated = { id: 1, name: 'Updated' };
        mockSpecialtiesService.update.mockResolvedValue(updated);

        const result = await controller.update(1, { name: 'Updated' });

        expect(service.update).toHaveBeenCalledWith(1, { name: 'Updated' });
        expect(result).toEqual(updated);
    });

    it('should call service.remove()', async () => {
        const deleted = { id: 1 };
        mockSpecialtiesService.remove.mockResolvedValue(deleted);

        const result = await controller.remove(1);

        expect(service.remove).toHaveBeenCalledWith(1);
        expect(result).toEqual(deleted);
    });
});
