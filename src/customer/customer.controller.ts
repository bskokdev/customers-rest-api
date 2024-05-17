import { Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CustomerService } from './service/customer.service';
import { BasicCustomerInfo, CreateCustomerRequest } from './dto/customer-dto';
import { UUID } from '../shared/types/uuid.type';
import { Customer } from './model/customer.entity';

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

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createCustomerRequest: CreateCustomerRequest): Promise<Customer> {
    return this.customerService.create(createCustomerRequest);
  }

  @Put(':id')
  async update(@Param('id') id: UUID, @Body() updatedCustomer: Partial<Customer>): Promise<Customer> {
    return this.customerService.update(id, updatedCustomer);
  }
}
