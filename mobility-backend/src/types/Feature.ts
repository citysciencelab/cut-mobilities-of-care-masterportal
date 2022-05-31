export type FeatureId = number;
export enum FeatureType {
  MOBILITY = 'mobility',
  ANNOTATION = 'annotation'
}

export type FeatureDAO = {
  feature_id: FeatureId;
  feature_type: FeatureType;
  feature_geometry: string;
  geometry_index: number;
  comment: string | null;
  title: string | null;
  mobility_mode: string;
  start_time: string | null;
  end_time: string | null;
  cost: string | null;
};

export type FeatureDTO = {
  featureId: FeatureId;
  featureGeometry: {
    type: string;
    coordinates: number[];
  };
  mobility_mode: string;
  geometryIndex: number;
  comment?: string;
};
