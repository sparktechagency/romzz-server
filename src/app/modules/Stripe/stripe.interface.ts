export interface IConnectAccount {
  dateOfBirth: string;
  address: {
    city: string;
    country: string;
    line1: string;
    postal_code: string;
  };
  bank_info: {
    account_holder_name: string;
    account_holder_type: string;
    account_number: string;
    routing_number: string;
    country: string;
    currency: string;
  };
}
