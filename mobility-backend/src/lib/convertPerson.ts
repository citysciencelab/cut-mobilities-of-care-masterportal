import { PersonDAO, PersonDTO } from '../types/Person';
import { PersonInNeedDAO } from '../types/PersonInNeed';

/**
 * Converts PersonDAO database object to PersonDTO transmission object
 * @param person
 * @param person_in_need
 */
const convertPerson = (
  person: PersonDAO,
  persons_in_need: PersonInNeedDAO[] | null
): PersonDTO => {
  // Required Properties
  const personDTO = {
    personId: person.person_id,
    dateCreated: person.date_created
  };
  // Optional Properties
  if (person.age) personDTO['age'] = person.age.trim();
  if (person.gender) personDTO['gender'] = person.gender;
  if (person.employment_status)
    personDTO['employmentStatus'] = person.employment_status.trim();
  if (person.household_income)
    personDTO['householdIncome'] = person.household_income.trim();
  if (person.marital_status)
    personDTO['maritialStatus'] = person.marital_status.trim();
  personDTO['personsInNeed'] = [];

  if (persons_in_need && persons_in_need.length) {
    persons_in_need.forEach((person_in_need) => {
      const personInNeed = {};
      if (person_in_need.name) personInNeed['name'] = person_in_need.name;
      if (person_in_need.age) personInNeed['age'] = person_in_need.age.trim();
      if (person_in_need.person_in_need_class)
        personInNeed['personInNeedClass'] =
          person_in_need.person_in_need_class.trim();
      if (person_in_need.is_same_household !== null)
        personInNeed['isSameHousehold'] = Boolean(
          person_in_need.is_same_household
        );
      personDTO['personsInNeed'].push(personInNeed);
    });
  }
  return personDTO;
};

export default convertPerson;
