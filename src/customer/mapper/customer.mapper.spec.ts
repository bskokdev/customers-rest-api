import { Customer } from '../model/customer.entity';
import { BasicCustomerInfo } from '../dto/customer-dto';
import { v4 as uuidv4 } from 'uuid';
import { basicCustomerInfoToCustomer, customerToBasicInfo } from './customer.mapper';

describe('Customer Mapper', () => {
  describe('customerToBasicInfo', () => {
    it('should convert Customer to BasicCustomerInfo', () => {
      const id = uuidv4();
      const customer: Customer = {
        id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      };

      const expectedBasicInfo: BasicCustomerInfo = {
        id,
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = customerToBasicInfo(customer);
      expect(result).toEqual(expectedBasicInfo);
    });
  });

  describe('basicCustomerInfoToCustomer', () => {
    it('should convert BasicCustomerInfo to Customer with empty email and phone', () => {
      const id = uuidv4();
      const basicInfo: BasicCustomerInfo = {
        id,
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const expectedCustomer: Customer = {
        id,
        firstName: 'Jane',
        lastName: 'Doe',
        email: '',
        phone: '',
      };

      const result = basicCustomerInfoToCustomer(basicInfo);
      expect(result).toEqual(expectedCustomer);
    });
  });
});
