import { AudioFileDAO } from './AudioFile';
import { ImageFileDAO } from './ImageFile';
import { MobilityFeatureDTO } from './MobilityFeature';
import { PersonId } from './Person';

export type MobilityEntryId = number;

export type MobilityEntryDAO = {
  entry_id: MobilityEntryId;
  date_created: string;
  description: string | null;
  weekdays: number[] | null;
  audio_files: AudioFileDAO[] | null;
  image_files: ImageFileDAO[] | null;
  personId: PersonId;
};

export type MobilityEntryDTO = {
  entryId: MobilityEntryId;
  dateCreated: string;
  description?: string;
  weekdays?: number[];
  audioFiles?: string[];
  imageFiles?: string[];
  mobilityFeatures: MobilityFeatureDTO[];
  personId?: PersonId;
};
