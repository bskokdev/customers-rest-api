import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../model/customer.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

@Injectable()
export class CustomerSeederService implements OnModuleInit {
  private readonly logger = new Logger(CustomerSeederService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

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
