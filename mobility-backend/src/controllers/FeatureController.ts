import pool from '../dbconfig/dbconnector';
import {
  FeatureDAO,
  FeatureDTO,
  FeatureId,
  FeatureType
} from '../types/Feature';
import { MobilityEntryId } from '../types/MobilityEntry';
import { MobilityFeatureDTO } from '../types/MobilityFeature';
import { valueOrNULL } from '../utils/db-utils';

class FeatureController {
  SELECT_FEATURES_SQL =
    'SELECT feature_id, title, feature_type, feature_geometry, geometry_index, mobility_mode, start_time, end_time, cost, comment FROM feature ' +
    'LEFT JOIN comment USING (feature_id) LEFT JOIN time_traveled USING (feature_id) ' +
    'LEFT JOIN cost USING (feature_id)';

  public async get(featureId?: FeatureId): Promise<FeatureDAO[]> {
    const client = await pool.connect();

    const sql =
      this.SELECT_FEATURES_SQL +
      (featureId ? ' WHERE feature_id = ' + featureId : '') +
      ' ORDER BY geometry_index';

    const { rows } = await client.query(sql);

    client.release();

    return rows;
  }

  public async getByEntryId(entryId: MobilityEntryId): Promise<FeatureDAO[]> {
    const client = await pool.connect();

    const sql =
      this.SELECT_FEATURES_SQL +
      ' WHERE entry_id = ' +
      entryId +
      ' ORDER BY geometry_index';

    const { rows } = await client.query(sql);

    client.release();

    return rows;
  }

  public async post(
    entryId: MobilityEntryId,
    feature: FeatureDTO,
    featureType: FeatureType
  ) {
    const client = await pool.connect();

    const { featureGeometry, geometryIndex, comment } = feature;
    const { title, mobilityMode, startTime, endTime, cost } =
      feature as MobilityFeatureDTO;

    const sql = `INSERT INTO feature (entry_id, title, mobility_mode, feature_geometry, geometry_index, feature_type) VALUES (
      '${entryId}',
      ${valueOrNULL(title)},
      ${valueOrNULL(mobilityMode)},
      '${JSON.stringify(featureGeometry)}',
      '${geometryIndex}',
      '${featureType}'
      ) RETURNING feature_id`;
    const { rows } = await client.query(sql);
    const featureId = rows[0].feature_id;

    if (comment) {
      const commentSQL = `INSERT INTO comment (comment, feature_id) VALUES ('${comment}','${featureId}')`;
      await client.query(commentSQL);
    }

    if (startTime || endTime) {
      const timeSQL = `INSERT INTO time_traveled (start_time, end_time, feature_id) VALUES (
        ${valueOrNULL(startTime)},
        ${valueOrNULL(endTime)},
        '${featureId}')`;
      await client.query(timeSQL);
    }

    if (cost) {
      const costSQL = `INSERT INTO cost (cost, feature_id) VALUES ('${cost}','${featureId}')`;
      await client.query(costSQL);
    }

    client.release();
  }
}

export default FeatureController;
