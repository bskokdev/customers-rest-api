import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Customer } from '../model/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BasicCustomerInfo, CreateCustomerRequest } from '../dto/customer-dto';
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

  async isAlreadyCreated(email: string, phone: string): Promise<boolean> {
    const existingCustomer = await this.customerRepository.findOne({
      where: [{ email }, { phone }],
    });
    return !!existingCustomer;
  }

  async create(customer: CreateCustomerRequest): Promise<Customer> {
    const { email, phone } = customer;
    if (await this.isAlreadyCreated(email, phone)) {
      this.logger.error(`Customer with ${email} or phone ${phone} already exists`);
      throw new ConflictException(`Customer with email ${email} or phone ${phone} already exists`);
    }

    const newCustomer = this.customerRepository.create(customer);
    const savedCustomer = await this.customerRepository.save(newCustomer);
    this.logger.debug(`Created a new customer with ID: ${savedCustomer.id}`);
    return savedCustomer;
  }

  async update(id: UUID, updatedCustomer: Partial<Customer>): Promise<Customer> {
    await this.customerRepository.update(id, updatedCustomer);
    return this.findDetailedCustomerById(id);
  }
}
