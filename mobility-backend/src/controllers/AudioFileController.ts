import pool from '../dbconfig/dbconnector';
import { AudioFileDAO } from '../types/AudioFile';
import { MobilityEntryId } from '../types/MobilityEntry';

class AudioFileController {
  public async post(filePath: string, entryId: MobilityEntryId) {
    const client = await pool.connect();

    const sql = `INSERT INTO audio (audio_file, entry_id) VALUES ('${filePath}','${entryId}')`;

    await client.query(sql);

    client.release();
  }

  public async get(entryId: MobilityEntryId): Promise<AudioFileDAO[]> {
    const client = await pool.connect();

    const sql = 'SELECT * FROM AUDIO WHERE entry_id = ' + entryId;

    const { rows } = await client.query(sql);

    client.release();

    return rows;
  }
}

export default AudioFileController;
