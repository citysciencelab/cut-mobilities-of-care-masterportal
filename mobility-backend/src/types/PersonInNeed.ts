import { PersonId } from './Person';

export type PersonInNeedId = number;

export type PersonInNeedDAO = {
  person_in_need_id: PersonInNeedId;
  name: string | null;
  age: string | null;
  person_in_need_class: string | null;
  is_same_household: boolean | null;
  person_id: PersonId;
};

export type PersonInNeedDTO = {
  personInNeedId: PersonInNeedId;
  name?: string;
  age?: string;
  personInNeedClass?: string;
  isSameHousehold?: boolean;
  personId: PersonId;
};
