interface Employee {
  id: number;
  email: string;
  name: string;
  surname: string;
  birth_date?: string;
  gender?: string;
  work?: string;
  customers_ids?: number[];
  last_connection?: number;
}

export default Employee;
