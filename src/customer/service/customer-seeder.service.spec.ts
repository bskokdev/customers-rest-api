import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerSeederService } from './customer-seeder.service';
import { Customer } from '../model/customer.entity';
import { faker } from '@faker-js/faker';

const mockCustomerRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

describe('CustomerSeederService', () => {
  let service: CustomerSeederService;
  let repository: jest.Mocked<Repository<Customer>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerSeederService,
        {
          provide: getRepositoryToken(Customer),
          useFactory: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerSeederService>(CustomerSeederService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer)) as jest.Mocked<Repository<Customer>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seed', () => {
    it('should create and save 50 mock customers', async () => {
      repository.create.mockImplementation(
        (customer) =>
          ({
            ...customer,
            id: faker.string.uuid(),
          }) as Customer
      );

      repository.save.mockImplementation(
        async (customer) =>
          ({
            ...customer,
            id: customer.id || faker.string.uuid(),
          }) as Customer
      );

      await service.seed();

      expect(repository.create).toHaveBeenCalledTimes(50);
      expect(repository.save).toHaveBeenCalledTimes(50);
    });
  });
});
