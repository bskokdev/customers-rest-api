import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { Customer } from '../model/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BasicCustomerInfo, CreateCustomerRequest, CustomerRequest, UpdateCustomerRequest } from '../dto/customer-dto';
import { customerToBasicInfo } from '../mapper/customer.mapper';
import { UUID } from '../../shared/types/uuid.type';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>
  ) {}

  async findAllCustomerWithBasicInfo(): Promise<BasicCustomerInfo[]> {
    const customers = await this.customerRepository.find();
    this.logger.debug(`Found ${customers.length} customers`);
    return customers.map((customer: Customer) => customerToBasicInfo(customer));
  }

  async findDetailedCustomerById(id: UUID): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      this.logger.error(`Customer with ID: ${id} not found.`);
      throw new NotFoundException(`Customer not found.`);
    }
    this.logger.debug('Found customer: ', JSON.stringify(customer, null, 2));
    return customer;
  }

  async create(newIncomingCustomer: CreateCustomerRequest): Promise<Customer> {
    const normalizedIncomingCustomer = this.normalizeCustomerRequest(newIncomingCustomer);
    const { email, phone } = normalizedIncomingCustomer;
    await this.checkIfEmailInUse(email);
    await this.checkIfPhoneInUse(phone);

    const createdCustomer = this.customerRepository.create(normalizedIncomingCustomer);
    const savedCustomer = await this.customerRepository.save(createdCustomer);
    this.logger.debug(`Created a new customer with ID: ${savedCustomer.id}`);
    return savedCustomer;
  }

  async update(id: UUID, updatedCustomer: UpdateCustomerRequest): Promise<Customer> {
    const customer = await this.findDetailedCustomerById(id);
    const { email, phone } = updatedCustomer;

    if (email) {
      await this.checkIfEmailInUse(email, id);
    }
    if (phone) {
      await this.checkIfPhoneInUse(phone, id);
    }

    Object.assign(customer, updatedCustomer);
    const savedCustomer = await this.customerRepository.save(customer);
    this.logger.debug(`Updated customer with ID: ${savedCustomer.id}`);
    return savedCustomer;
  }

  normalizeCustomerRequest<T extends CustomerRequest>(customer: T): T {
    const normalized: any = {};

    if (customer.firstName !== undefined) {
      normalized.firstName = customer.firstName.trim();
    }
    if (customer.lastName !== undefined) {
      normalized.lastName = customer.lastName.trim();
    }
    if (customer.email !== undefined) {
      normalized.email = customer.email.trim();
    }
    if (customer.phone !== undefined) {
      normalized.phone = customer.phone.replace(/\s+/g, '').trim();
    }

    return normalized as T;
  }

  private async checkIfEmailInUse(email: string, excludeId?: UUID): Promise<void> {
    const whereClause = excludeId ? { email, id: Not(excludeId) } : { email };
    const existingCustomerWithEmail = await this.customerRepository.findOne({ where: whereClause });
    if (existingCustomerWithEmail) {
      this.logger.error(`Customer with email ${email} already exists.`);
      throw new ConflictException(`Customer with email ${email} already exists.`);
    }
  }

  private async checkIfPhoneInUse(phone: string, excludeId?: UUID): Promise<void> {
    const whereClause = excludeId ? { phone, id: Not(excludeId) } : { phone };
    const existingCustomerWithPhone = await this.customerRepository.findOne({ where: whereClause });
    if (existingCustomerWithPhone) {
      this.logger.error(`Customer with phone ${phone} already exists.`);
      throw new ConflictException(`Customer with phone ${phone} already exists.`);
    }
  }
}
