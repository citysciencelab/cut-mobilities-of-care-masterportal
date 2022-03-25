import { MobilityEntryDTO } from './MobilityEntry';
import { PersonInNeedDTO } from './PersonInNeed';

export type PersonId = number;

export type PersonDAO = {
  person_id: PersonId;
  date_created: string;
  age: string | null;
  gender: string | null;
  marital_status: string | null;
  employment_status: string | null;
  household_income: string | null;
  additional: string | null;
};

export type PersonDTO = {
  personId?: PersonId;
  dateCreated: string;
  age?: string;
  gender?: string;
  maritalStatus?: string;
  employmentStatus?: string;
  householdIncome?: string;
  additional?: string;
  personsInNeed?: PersonInNeedDTO[];
  mobilityEntries?: MobilityEntryDTO[];
};
