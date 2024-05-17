import { UUID } from '../../shared/types/uuid.type';
import { Customer } from '../model/customer.entity';

export interface BasicCustomerInfo {
  id: UUID;
  firstName: string;
  lastName: string;
}

export type CreateCustomerRequest = Omit<Customer, 'id'>;
