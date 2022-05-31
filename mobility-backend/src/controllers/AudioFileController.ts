import pool from '../dbconfig/dbconnector';
import { AudioFileDAO } from '../types/AudioFile';
import {FeatureId} from "../types/Feature";

class AudioFileController {
  public async post(filePath: string, featureId: FeatureId) {
    const client = await pool.connect();

    const sql = `INSERT INTO audio (audio_file, feature_id) VALUES ('${filePath}','${featureId}')`;

    await client.query(sql);

    client.release();
  }

  public async get(featureId: FeatureId): Promise<AudioFileDAO[]> {
    const client = await pool.connect();

    const sql = 'SELECT * FROM AUDIO WHERE feature_id = ' + featureId;

    const { rows } = await client.query(sql);

    client.release();

    return rows;
  }
}

export default AudioFileController;
