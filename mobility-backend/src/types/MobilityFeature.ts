import { FeatureDTO } from './Feature';

export type MobilityFeatureDTO = FeatureDTO & {
  title?: string;
  mobilityMode: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
};
