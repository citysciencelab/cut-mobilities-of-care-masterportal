import pool from '../dbconfig/dbconnector';
import { PersonId } from '../types/Person';
import { PersonInNeedDAO, PersonInNeedDTO } from '../types/PersonInNeed';
import { valueOrNULL } from '../utils/db-utils';

class PersonInNeedController {
  public async get(personId: PersonId): Promise<PersonInNeedDAO[]> {
    const client = await pool.connect();

    const sql = 'SELECT * FROM person_in_need WHERE person_id = ' + personId;

    const { rows } = await client.query(sql);

    client.release();

    return rows;
  }

  public async post({
    name,
    age,
    personInNeedClass,
    isSameHousehold,
    personId
  }: PersonInNeedDTO): Promise<void> {
    const client = await pool.connect();

    const sql = `INSERT INTO person_in_need (name, age, person_in_need_class, is_same_household, person_id) VALUES (
      ${valueOrNULL(name)},
      ${valueOrNULL(age)},
      ${valueOrNULL(personInNeedClass)},
      ${valueOrNULL(isSameHousehold)},
      '${personId}')`;

    await client.query(sql);

    client.release();
  }
}

export default PersonInNeedController;
