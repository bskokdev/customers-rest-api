import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../model/customer.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

/**
 * This service creates random customer records and seeds the database with them on module init.
 * The seeding is only available in the development, and should probably be triggered by a custom NestJS command instead.
 * However, that's outside the scope of this project.
 */
@Injectable()
export class CustomerSeederService implements OnModuleInit {
  private readonly logger = new Logger(CustomerSeederService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>
  ) {}

  /*
  This function is run on the module initialization, only in the development ENV
   */
  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      await this.seed();
    }
  }

  /**
   * Seeds the database with a random data using the faker library.
   */
  async seed(): Promise<void> {
    this.logger.debug('Seeding customer database table');
    for (let i = 0; i < 50; i++) {
      const mockCustomer = this.customerRepository.create({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      });
      const savedMockCustomer = await this.customerRepository.save(mockCustomer);
      this.logger.debug(`Created a mock customer with ID: ${savedMockCustomer.id}`);
    }
  }
}
