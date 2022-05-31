import pool from '../dbconfig/dbconnector';
import { PersonDAO, PersonDTO, PersonId } from '../types/Person';
import { valueOrNULL } from '../utils/db-utils';

class PersonController {
  public async get(): Promise<PersonDAO[]> {
    const client = await pool.connect();

    const sql = 'SELECT * FROM person ORDER BY person_id';

    const { rows } = await client.query(sql);

    client.release();

    return rows;
  }

  public async post({
    age,
    gender,
    maritalStatus,
    employmentStatus,
    householdIncome,
    additional
  }: PersonDTO): Promise<PersonId> {
    const client = await pool.connect();

    const sql = `INSERT INTO person (age, gender, marital_status, employment_status, household_income, additional) VALUES (
      ${valueOrNULL(age)},
      ${valueOrNULL(gender)},
      ${valueOrNULL(maritalStatus)},
      ${valueOrNULL(employmentStatus)},
      ${valueOrNULL(householdIncome)},
      ${valueOrNULL(additional)}
      ) RETURNING person_id`;

    const { rows } = await client.query(sql);

    client.release();

    return rows[0].person_id as PersonId;
  }

  public async update({
    personId,
    age,
    gender,
    maritalStatus,
    employmentStatus,
    householdIncome,
    additional
  }: PersonDTO): Promise<PersonId> {
    const client = await pool.connect();

    const sql = `UPDATE person SET
                  age = ${valueOrNULL(age)},
                  gender = ${valueOrNULL(gender)},
                  marital_status = ${valueOrNULL(maritalStatus)},
                  employment_status = ${valueOrNULL(employmentStatus)},
                  household_income = ${valueOrNULL(householdIncome)},
                  additional  = ${valueOrNULL(additional)}
                  WHERE
                  person_id = ${valueOrNULL(personId)}`;

    await client.query(sql);

    client.release();

    return personId as PersonId;
  }

  public async delete(personId: PersonId): Promise<void> {
    const client = await pool.connect();

    const sql = 'DELETE FROM person WHERE person_id = ' + personId;

    await client.query(sql);

    client.release();
  }
}

export default PersonController;
