import pool from '../dbconfig/dbconnector';
import {
  MobilityEntryDAO,
  MobilityEntryDTO,
  MobilityEntryId
} from '../types/MobilityEntry';
import { PersonId } from '../types/Person';
import { valueOrNULL } from '../utils/db-utils';

class MobilityEntryController {
  public async get(personId?: PersonId): Promise<MobilityEntryDAO[]> {
    const client = await pool.connect();

    const sql =
      'SELECT entry_id, date_created, description, weekdays FROM mobility_entry' +
      (personId ? ' WHERE person_id = ' + personId : '') +
      ' ORDER BY entry_id';

    const { rows } = await client.query(sql);

    client.release();

    return rows;
  }

  public async post({
    personId,
    description,
    weekdays
  }: MobilityEntryDTO): Promise<MobilityEntryId> {
    const client = await pool.connect();

    const weekdaysValue =
      weekdays && weekdays.length ? "'{" + weekdays.join(',') + "}'" : 'NULL';

    const sql = `INSERT INTO mobility_entry (person_id, description, weekdays) VALUES (
      '${personId}',
      ${valueOrNULL(description)},
      ${weekdaysValue}) RETURNING entry_id`;

    const { rows } = await client.query(sql);

    client.release();

    return rows[0].entry_id as MobilityEntryId;
  }

  public async delete(entryId: MobilityEntryId): Promise<void> {
    const client = await pool.connect();

    const sql = 'DELETE FROM mobility_entry WHERE entry_id = ' + entryId;

    await client.query(sql);

    client.release();
  }
}

export default MobilityEntryController;
