interface Encounter {
  id: number;
  customer_id: number;
  date: string;
  rating: number;
  comment?: string;
  source?: string;
}

export default Encounter;
