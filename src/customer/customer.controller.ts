import { Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CustomerService } from './service/customer.service';
import { BasicCustomerInfo, CreateCustomerRequest, UpdateCustomerRequest } from './dto/customer-dto';
import { UUID } from '../shared/types/uuid.type';
import { Customer } from './model/customer.entity';

/**
 * Core REST controller of the Customer module exposing customer related endpoints.
 */
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async findAllBasicInfo(): Promise<BasicCustomerInfo[]> {
    return this.customerService.findAllCustomerWithBasicInfo();
  }

  @Get(':id')
  async findOneDetailedById(@Param('id') id: UUID): Promise<Customer> {
    return this.customerService.findDetailedCustomerById(id);
  }

  /*
   * Create and Update will throw an invalid request response if the email or phone number are not valid.
   * It's due to the use of class validators instead implementing the validation myself for simplicity.
   * */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createCustomerRequest: CreateCustomerRequest): Promise<Customer> {
    return this.customerService.create(createCustomerRequest);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: UUID, @Body() updatedCustomer: UpdateCustomerRequest): Promise<Customer> {
    return this.customerService.update(id, updatedCustomer);
  }
}
