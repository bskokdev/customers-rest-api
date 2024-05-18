import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { Customer } from '../model/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BasicCustomerInfo, CreateCustomerRequest, CustomerRequest, UpdateCustomerRequest } from '../dto/customer-dto';
import { customerToBasicInfo } from '../mapper/customer.mapper';
import { UUID } from '../../shared/types/uuid.type';

/**
 * Handles all the customer related business logic which can be injected to other services or controllers.
 */
@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>
  ) {}

  /**
   * Finds an array of basic customer information.
   * The DTO is constructed via a mapper to provide a cleaner response instead of returning the entity itself.
   * @returns Promise<BasicCustomerInfo[]> - Resolves after finding and mapping all customer information.
   */
  async findAllCustomerWithBasicInfo(): Promise<BasicCustomerInfo[]> {
    const customers = await this.customerRepository.find();
    this.logger.debug(`Found ${customers.length} customers`);
    return customers.map((customer: Customer) => customerToBasicInfo(customer));
  }

  /**
   * Finds the customer by id. In this case the Customer entity is returned to provide all the details.
   * @param id - ID of a customer to be found.
   * @throws NotFoundException - If the customer isn't found.
   * @returns Promise<Customer> - Resolves if customer is found, rejects if not.
   */
  async findDetailedCustomerById(id: UUID): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      this.logger.error(`Customer with ID: ${id} not found.`);
      throw new NotFoundException(`Customer not found.`);
    }
    this.logger.debug('Found customer: ', JSON.stringify(customer, null, 2));
    return customer;
  }

  /**
   * Creates a new Customer record in the database from the incoming request DTO.
   * @param newIncomingCustomer - Request DTO which doesn't contain the ID (as it's auto generated).
   * @throws ConflictException -
   *  If the email or phone number are already used.
   *  This is propagated from checkIfEmailInUse and checkIfPhoneInUse methods.
   * @returns Promise<Customer> - Resolves if customer is saved correctly, rejects if email or phone is already used.
   */
  async create(newIncomingCustomer: CreateCustomerRequest): Promise<Customer> {
    const normalizedIncomingCustomer = this.processCustomerRequest(newIncomingCustomer);
    const { email, phone } = normalizedIncomingCustomer;
    await this.checkIfEmailInUse(email);
    await this.checkIfPhoneInUse(phone);

    const createdCustomer = this.customerRepository.create(normalizedIncomingCustomer);
    const savedCustomer = await this.customerRepository.save(createdCustomer);
    this.logger.debug(`Created a new customer with ID: ${savedCustomer.id}`);
    return savedCustomer;
  }

  /**
   * Updates and saves the customer information for a customer found by the provided ID.
   * Also checks if email or phone number are already used by another customer.
   * @param id - ID of the customer to be updated.
   * @param updatedCustomer - Body of the customer which has to be updated.
   * @throws ConflictException - If email or phone is used by another customer.
   * @returns Promise<Customer> -
   *   Resolves if customer is saved correctly, rejects if the email or phone is already used, or user is not found by ID.
   */
  async update(id: UUID, updatedCustomer: UpdateCustomerRequest): Promise<Customer> {
    const normalizedUpdatedCustomer = this.processCustomerRequest(updatedCustomer);
    const customer = await this.findDetailedCustomerById(id);
    const { email, phone } = normalizedUpdatedCustomer;

    if (email) {
      await this.checkIfEmailInUse(email, id);
    }
    if (phone) {
      await this.checkIfPhoneInUse(phone, id);
    }

    Object.assign(customer, normalizedUpdatedCustomer);
    const savedCustomer = await this.customerRepository.save(customer);
    this.logger.debug(`Updated customer with ID: ${savedCustomer.id}`);
    return savedCustomer;
  }

  /**
   * Processes CustomerRequest in order to keep consistent data entries.
   * Prefix and suffix spaces are removed, as well as spaces within the phone number.
   * @param customer - CustomerRequest to be processed.
   * @return CustomerRequest - Processed CustomerRequest with trimmed spaces.
   */
  processCustomerRequest<T extends CustomerRequest>(customer: T): T {
    const processed: Partial<CustomerRequest> = {};

    if (customer.firstName) {
      processed.firstName = customer.firstName.trim();
    }
    if (customer.lastName) {
      processed.lastName = customer.lastName.trim();
    }
    // CustomerRequest email and phone fields do not accept a trailing space in the request
    // The reason for that is that the pipe checks are done via isEmail() and isPhoneNumber() annotations
    // The field will not pass such check if it contains a trailing space and an InvalidRequest response is returned
    if (customer.email) {
      processed.email = customer.email.trim();
    }
    if (customer.phone) {
      processed.phone = customer.phone.replace(/\s+/g, '').trim();
    }
    this.logger.debug('Processed CustomerRequest: ', JSON.stringify(processed, null, 2));
    return processed as T;
  }

  /**
   * Checks if an email is already in use by another customer, excluding a specific customer by ID if provided.
   * @param email - The email address to check.
   * @param [excludeId] - The ID of the customer to exclude from the check.
   * @throws ConflictException If the email is already in use by another customer.
   */
  private async checkIfEmailInUse(email: string, excludeId?: UUID): Promise<void> {
    const whereClause = excludeId ? { email, id: Not(excludeId) } : { email };
    const existingCustomerWithEmail = await this.customerRepository.findOne({ where: whereClause });
    if (existingCustomerWithEmail) {
      this.logger.error(`Customer with email ${email} already exists.`);
      throw new ConflictException(`Customer with email ${email} already exists.`);
    }
  }

  /**
   * Checks if a phone number is already in use by another customer, excluding a specific customer by ID if provided.
   * @param phone - The phone number to check.
   * @param [excludeId] - The ID of the customer to exclude from the check.
   * @throws ConflictException If the phone number is already in use by another customer.
   */
  private async checkIfPhoneInUse(phone: string, excludeId?: UUID): Promise<void> {
    const whereClause = excludeId ? { phone, id: Not(excludeId) } : { phone };
    const existingCustomerWithPhone = await this.customerRepository.findOne({ where: whereClause });
    if (existingCustomerWithPhone) {
      this.logger.error(`Customer with phone ${phone} already exists.`);
      throw new ConflictException(`Customer with phone ${phone} already exists.`);
    }
  }
}
