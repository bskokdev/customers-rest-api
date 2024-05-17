import { Customer } from '../model/customer.entity';
import { BasicCustomerInfo } from '../dto/customer-dto';

export function customerToBasicInfo(customer: Customer): BasicCustomerInfo {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
  };
}

export function basicCustomerInfoToCustomer(basicInfo: BasicCustomerInfo): Customer {
  return {
    id: basicInfo.id,
    firstName: basicInfo.firstName,
    lastName: basicInfo.lastName,
    email: '',
    phone: '',
  };
}
