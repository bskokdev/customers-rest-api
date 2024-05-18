import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { Customer } from '../model/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BasicCustomerInfo, CreateCustomerRequest } from '../dto/customer-dto';
import { customerToBasicInfo } from '../mapper/customer.mapper';
import { UUID } from '../../shared/types/uuid.type';
import { CommandUtils } from 'typeorm/commands/CommandUtils';

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
    const normalizedIncomingCustomer = this.normalizeCreateDTO(newIncomingCustomer);
    const { email, phone } = normalizedIncomingCustomer;
    await this.checkIfEmailInUse(email);
    await this.checkIfPhoneInUse(phone);

    const createdCustomer = this.customerRepository.create(normalizedIncomingCustomer);
    const savedCustomer = await this.customerRepository.save(createdCustomer);
    this.logger.debug(`Created a new customer with ID: ${savedCustomer.id}`);
    return savedCustomer;
  }

  async update(id: UUID, updatedCustomer: Partial<Customer>): Promise<Customer> {
    const customer = await this.findDetailedCustomerById(id);
    const { email, phone } = updatedCustomer;

    await this.checkIfEmailInUse(email, id);
    await this.checkIfPhoneInUse(phone, id);

    Object.assign(customer, updatedCustomer);
    const savedCustomer = await this.customerRepository.save(customer);
    this.logger.debug(`Updated customer with ID: ${savedCustomer.id}`);
    return savedCustomer;
  }

  private normalizeCreateDTO(customer: CreateCustomerRequest): CreateCustomerRequest {
    return {
      firstName: customer.firstName.trim(),
      lastName: customer.lastName.trim(),
      email: customer.email.trim(),
      phone: customer.phone.replace(/\s+/g, '').trim(),
    };
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
