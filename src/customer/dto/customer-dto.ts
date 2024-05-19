import { UUID } from '../../shared/types/uuid.type';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data payload containing only basic information about the customer.
 */
export interface BasicCustomerInfo {
  id: UUID;
  firstName: string;
  lastName: string;
}

/**
 * Request type which is passed upon creating a new customer.
 */
export class CreateCustomerRequest {
  @IsString()
  @Length(1, 50)
  @ApiProperty()
  firstName: string;

  @IsString()
  @Length(1, 50)
  @ApiProperty()
  lastName: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsPhoneNumber(null)
  @ApiProperty()
  phone: string;
}

/**
 * Request type which is passed upon updating a customer.
 * ID is not required here because it's passed as a parameter to the endpoint.
 */
export class UpdateCustomerRequest {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty()
  email?: string;

  @IsOptional()
  @IsPhoneNumber(null)
  @ApiProperty()
  phone?: string;
}

export type CustomerRequest = CreateCustomerRequest | UpdateCustomerRequest;
