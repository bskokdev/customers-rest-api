import { Customer } from '../model/customer.entity';
import { BasicCustomerInfo } from '../dto/customer-dto';

/**
 * Maps the Customer entity to BasicCustomerInfo DTO to provide a better data payload.
 * @param customer - Customer entity to convert.
 * @returns BasicCustomerInfo - Shorthand data payload for the Customer entity.
 */
export function customerToBasicInfo(customer: Customer): BasicCustomerInfo {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
  };
}

/**
 * Maps the BasicCustomerInfo DTO to the Customer entity.
 * Since it doesn't contain all the fields, it has to default to empty strings email and phone.
 * @param basicInfo - Shorthand data payload for the Customer entity.
 * @returns Customer - The full Customer entity with email and phone defaulting to an empty string.
 */
export function basicCustomerInfoToCustomer(basicInfo: BasicCustomerInfo): Customer {
  return {
    id: basicInfo.id,
    firstName: basicInfo.firstName,
    lastName: basicInfo.lastName,
    email: '',
    phone: '',
  };
}
