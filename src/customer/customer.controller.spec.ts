import { Test, TestingModule } from '@nestjs/testing';
import { Customer } from './model/customer.entity';
import { UUID } from '../shared/types/uuid.type';
import { BasicCustomerInfo, CreateCustomerRequest } from './dto/customer-dto';
import { CustomerController } from './customer.controller';
import { CustomerService } from './service/customer.service';

const mockCustomer: Customer = {
  id: '0' as UUID,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '1234567889',
} as Customer;

const mockCustomerArray: Customer[] = [
  {
    id: '0' as UUID,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567889',
  },
  {
    id: '1' as UUID,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '0987654320',
  },
] as Customer[];

export const mockBasicCustomerInfoArray: BasicCustomerInfo[] = mockCustomerArray.map((customer: Customer) => {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
  };
});

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: CustomerService;

  const mockCustomerService = {
    findAllCustomerWithBasicInfo: jest.fn().mockResolvedValue(mockBasicCustomerInfoArray),
    findDetailedCustomerById: jest.fn().mockResolvedValue(mockCustomer),
    create: jest.fn().mockResolvedValue(mockCustomer),
    update: jest.fn().mockResolvedValue(mockCustomer),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllBasicInfo', () => {
    it('should return an array of basic customer info', async () => {
      expect(await controller.findAllBasicInfo()).toEqual(mockBasicCustomerInfoArray);
      expect(service.findAllCustomerWithBasicInfo).toHaveBeenCalled();
    });
  });

  describe('findOneDetailedById', () => {
    it('should return a detailed customer by id', async () => {
      const id: UUID = mockCustomer.id;

      expect(await controller.findOneDetailedById(id)).toEqual(mockCustomer);
      expect(service.findDetailedCustomerById).toHaveBeenCalledWith(id);
    });
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const createCustomerRequest: CreateCustomerRequest = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '0987654320',
      };

      expect(await controller.create(createCustomerRequest)).toEqual(mockCustomer);
      expect(service.create).toHaveBeenCalledWith(createCustomerRequest);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const id: UUID = mockCustomer.id;
      const updatedCustomer: Partial<Customer> = { firstName: 'Jane', lastName: 'Doe' };

      expect(await controller.update(id, updatedCustomer)).toEqual(mockCustomer);
      expect(service.update).toHaveBeenCalledWith(id, updatedCustomer);
    });
  });
});
