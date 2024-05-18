import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerService } from './customer.service';
import { Customer } from '../model/customer.entity';
import { CreateCustomerRequest, UpdateCustomerRequest } from '../dto/customer-dto';
import { customerToBasicInfo } from '../mapper/customer.mapper';
import { v4 as uuidv4 } from 'uuid';

const mockCustomerRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockCustomer: Customer = {
  id: uuidv4(),
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '1234567890',
};

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: jest.Mocked<Repository<Customer>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Customer),
          useFactory: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer)) as jest.Mocked<Repository<Customer>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllCustomerWithBasicInfo', () => {
    it('should return an array of customers with basic info', async () => {
      repository.find.mockResolvedValue([mockCustomer]);
      const result = await service.findAllCustomerWithBasicInfo();
      expect(result).toEqual([customerToBasicInfo(mockCustomer)]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findDetailedCustomerById', () => {
    it('should return a customer if found', async () => {
      repository.findOneBy.mockResolvedValue(mockCustomer);
      const result = await service.findDetailedCustomerById(mockCustomer.id);
      expect(result).toEqual(mockCustomer);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockCustomer.id });
    });

    it('should throw NotFoundException if customer not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findDetailedCustomerById(mockCustomer.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new customer', async () => {
      const newCustomer: CreateCustomerRequest = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '0987654321',
      };

      repository.create.mockReturnValue(mockCustomer);
      repository.save.mockResolvedValue(mockCustomer);
      repository.findOne.mockResolvedValue(null);

      const result = await service.create(newCustomer);
      expect(result).toEqual(mockCustomer);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining(newCustomer));
      expect(repository.save).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw ConflictException if email is in use', async () => {
      const newCustomer: CreateCustomerRequest = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: mockCustomer.email,
        phone: '0987654321',
      };

      repository.findOne.mockResolvedValue(mockCustomer);
      await expect(service.create(newCustomer)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if phone is in use', async () => {
      const newCustomer: CreateCustomerRequest = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: mockCustomer.phone,
      };

      repository.findOne.mockResolvedValue(mockCustomer);
      await expect(service.create(newCustomer)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update and return an existing customer', async () => {
      const updatedCustomer: UpdateCustomerRequest = {
        firstName: 'Jane',
        email: 'jane.doe@example.com',
      };

      repository.findOneBy.mockResolvedValue(mockCustomer);
      repository.save.mockResolvedValue({ ...mockCustomer, ...updatedCustomer });
      repository.findOne.mockResolvedValue(null);

      const result = await service.update(mockCustomer.id, updatedCustomer);
      expect(result).toEqual({ ...mockCustomer, ...updatedCustomer });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ ...mockCustomer, ...updatedCustomer }));
    });

    it('should throw NotFoundException if customer not found', async () => {
      const updatedCustomer: UpdateCustomerRequest = { firstName: 'Jane' };
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.update(mockCustomer.id, updatedCustomer)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email is in use', async () => {
      const updatedCustomer: UpdateCustomerRequest = { email: 'new.email@example.com' };
      repository.findOneBy.mockResolvedValue(mockCustomer);
      repository.findOne.mockResolvedValue({ ...mockCustomer, id: uuidv4() });

      await expect(service.update(mockCustomer.id, updatedCustomer)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if phone is in use', async () => {
      const updatedCustomer: UpdateCustomerRequest = { phone: '0987654321' };
      repository.findOneBy.mockResolvedValue(mockCustomer);
      repository.findOne.mockResolvedValue({ ...mockCustomer, id: uuidv4() });

      await expect(service.update(mockCustomer.id, updatedCustomer)).rejects.toThrow(ConflictException);
    });
  });

  describe('normalize customer requests', () => {
    it('should normalize CreateCustomerRequest', () => {
      const input: CreateCustomerRequest = {
        firstName: ' John ',
        lastName: ' Doe ',
        email: ' john.doe@example.com ',
        phone: ' 123 456 7890 ',
      };

      const expectedOutput: CreateCustomerRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      };

      const result = service.normalizeCustomerRequest(input);
      expect(result).toEqual(expectedOutput);
    });

    it('should normalize UpdateCustomerRequest', () => {
      const input: UpdateCustomerRequest = {
        firstName: ' Jane ',
        lastName: ' Smith ',
        email: ' jane.smith@example.com ',
        phone: ' 987 654 3210 ',
      };

      const expectedOutput: UpdateCustomerRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '9876543210',
      };

      const result = service.normalizeCustomerRequest(input);
      expect(result).toEqual(expectedOutput);
    });

    it('should handle partial UpdateCustomerRequest', () => {
      const input: UpdateCustomerRequest = {
        firstName: ' Mike ',
        email: ' mike.jones@example.com ',
      };

      const expectedOutput: UpdateCustomerRequest = {
        firstName: 'Mike',
        email: 'mike.jones@example.com',
      };

      const result = service.normalizeCustomerRequest(input);
      expect(result).toEqual(expectedOutput);
    });
  });
});
