import { Test, TestingModule } from '@nestjs/testing';
import { SpecialitiesController } from '../controllers/specialities.controller';
import { SpecialitiesService } from '../services/specialities.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('SpecialitiesController', () => {
    let controller: SpecialitiesController;
    let service: SpecialitiesService;

    const mockSpecialitiesService = {
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
            controllers: [SpecialitiesController],
            providers: [{ provide: SpecialitiesService, useValue: mockSpecialitiesService }],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .overrideGuard(RolesGuard)
            .useValue(mockRolesGuard)
            .compile();

        controller = module.get<SpecialitiesController>(SpecialitiesController);
        service = module.get<SpecialitiesService>(SpecialitiesService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should call service.create()', async () => {
        const dto = { name: 'Warrior' };
        mockSpecialitiesService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);

        expect(service.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ id: 1, ...dto });
    });

    it('should call service.findAll()', async () => {
        const specialities = [{ id: 1, name: 'Mage' }];
        mockSpecialitiesService.findAll.mockResolvedValue(specialities);

        const result = await controller.findAll();

        expect(service.findAll).toHaveBeenCalled();
        expect(result).toEqual(specialities);
    });

    it('should call service.findOne()', async () => {
        const speciality = { id: 1, name: 'Warrior' };
        mockSpecialitiesService.findOne.mockResolvedValue(speciality);

        const result = await controller.findOne(1);

        expect(service.findOne).toHaveBeenCalledWith(1);
        expect(result).toEqual(speciality);
    });

    it('should call service.update()', async () => {
        const updated = { id: 1, name: 'Updated' };
        mockSpecialitiesService.update.mockResolvedValue(updated);

        const result = await controller.update(1, { name: 'Updated' });

        expect(service.update).toHaveBeenCalledWith(1, { name: 'Updated' });
        expect(result).toEqual(updated);
    });

    it('should call service.remove()', async () => {
        const deleted = { id: 1 };
        mockSpecialitiesService.remove.mockResolvedValue(deleted);

        const result = await controller.remove(1);

        expect(service.remove).toHaveBeenCalledWith(1);
        expect(result).toEqual(deleted);
    });
});
