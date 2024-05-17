import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CustomerModule } from './customer/customer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer/model/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Customer],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Customer]),
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
