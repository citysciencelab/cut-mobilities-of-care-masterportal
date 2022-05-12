import pool from '../dbconfig/dbconnector';
import { ImageFileDAO } from '../types/ImageFile';
import {FeatureId} from "../types/Feature";

class ImageFileController {
  public async post(filePath: string, featureId: FeatureId) {
    const client = await pool.connect();

    const sql = `INSERT INTO image (image_file, feature_id) VALUES ('${filePath}','${featureId}')`;

    await client.query(sql);

    client.release();
  }

  public async get(featureId: FeatureId): Promise<ImageFileDAO[]> {
    const client = await pool.connect();

    const sql = 'SELECT * FROM IMAGE WHERE feature_id = ' + featureId;

    const { rows } = await client.query(sql);

    client.release();

    return rows;
  }
}

export default ImageFileController;
