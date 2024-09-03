interface Customer {
  id: number;
  email: string;
  name: string;
  surname: string;
  birth_date?: string;
  gender?: string;
  description?: string;
  astrological_sign?: string;
}

export default Customer;
