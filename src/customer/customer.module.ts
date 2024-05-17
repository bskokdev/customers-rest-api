import { Module } from '@nestjs/common';
import { CustomerService } from './service/customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './model/customer.entity';
import { CustomerSeederService } from './service/customer-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [CustomerService, CustomerSeederService],
  controllers: [CustomerController],
})
export class CustomerModule {}
