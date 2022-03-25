import { AudioFileDAO } from './AudioFile';
import { MobilityFeatureDTO } from './MobilityFeature';
import { PersonId } from './Person';

export type MobilityEntryId = number;

export type MobilityEntryDAO = {
  entry_id: MobilityEntryId;
  date_created: string;
  description: string | null;
  weekdays: number[] | null;
  audio_files: AudioFileDAO[] | null;
  personId: PersonId;
};

export type MobilityEntryDTO = {
  entryId: MobilityEntryId;
  dateCreated: string;
  description?: string;
  weekdays?: number[];
  audioFiles?: string[];
  mobilityFeatures: MobilityFeatureDTO[];
  personId?: PersonId;
};
