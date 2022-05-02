import pool from '../dbconfig/dbconnector';
import { ImageFileDAO } from '../types/ImageFile';
import { MobilityEntryId } from '../types/MobilityEntry';

class ImageFileController {
  public async post(filePath: string, entryId: MobilityEntryId) {
    const client = await pool.connect();

    const sql = `INSERT INTO image (image_file, entry_id) VALUES ('${filePath}','${entryId}')`;

    await client.query(sql);

    client.release();
  }

  public async get(entryId: MobilityEntryId): Promise<ImageFileDAO[]> {
    const client = await pool.connect();

    const sql = 'SELECT * FROM IMAGE WHERE entry_id = ' + entryId;

    const { rows } = await client.query(sql);

    client.release();

    return rows;
  }
}

export default ImageFileController;
