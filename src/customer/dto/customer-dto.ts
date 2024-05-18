import { UUID } from '../../shared/types/uuid.type';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export interface BasicCustomerInfo {
  id: UUID;
  firstName: string;
  lastName: string;
}

export class CreateCustomerRequest {
  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber(null)
  phone: string;
}

export class UpdateCustomerRequest {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber(null)
  phone?: string;
}

export type CustomerRequest = CreateCustomerRequest | UpdateCustomerRequest;
