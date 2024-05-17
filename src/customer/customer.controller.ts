import { Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { CustomerService } from './service/customer.service';
import { BasicCustomerInfo, CreateCustomerRequest } from './dto/customer-dto';
import { UUID } from '../shared/types/uuid.type';
import { Customer } from './model/customer.entity';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async findAllBasicInfo(): Promise<BasicCustomerInfo[]> {
    return this.customerService.findAllBasicInfo();
  }

  @Get(':id')
  async findOneDetailedById(@Param('id') id: UUID): Promise<Customer> {
    try {
      return await this.customerService.findOneDetailedById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createCustomerRequest: CreateCustomerRequest): Promise<Customer> {
    try {
      return await this.customerService.create(createCustomerRequest);
    } catch (error) {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: UUID, @Body() updatedCustomer: Partial<Customer>): Promise<Customer> {
    try {
      return await this.customerService.update(id, updatedCustomer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
