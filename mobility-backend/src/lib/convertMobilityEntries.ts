import AudioFileController from '../controllers/AudioFileController';
import FeatureController from '../controllers/FeatureController';
import { FeatureDAO } from '../types/Feature';
import { MobilityEntryDAO, MobilityEntryDTO } from '../types/MobilityEntry';
import convertFeatures from './convertFeatures';

const featureController = new FeatureController();
const audioFileController = new AudioFileController();

/**
 * Converts MobilityEntryDAO database objects to MobilityEntryDTO transmission objects
 * @param mobility_entries
 * @param featureController
 */
const convertMobilityEntries = async (
  mobility_entries: MobilityEntryDAO[]
): Promise<MobilityEntryDTO[]> => {
  return Promise.all(
    mobility_entries.map(async (mobility_entry: MobilityEntryDAO) => {
      const featureDAOs: FeatureDAO[] = await featureController.getByEntryId(
        mobility_entry.entry_id
      );

      // Required Properties
      let mobilityEntry = {
        entryId: mobility_entry.entry_id,
        dateCreated: mobility_entry.date_created
      };

      // Optional Properties
      if (mobility_entry.description)
        mobilityEntry['description'] = mobility_entry.description;

      if (mobility_entry.weekdays)
        mobilityEntry['weekdays'] = mobility_entry.weekdays;

      const audioFiles = await audioFileController.get(mobility_entry.entry_id);
      if (audioFiles && audioFiles.length)
        mobilityEntry['audioFiles'] = audioFiles.map(
          (audioFile) => audioFile.audio_file
        );

      const features = convertFeatures(featureDAOs);
      return {
        ...mobilityEntry,
        // More Required Properties
        mobilityFeatures: features.mobilityFeatures,
        annotationFeatures: features.annotationFeatures
      };
    })
  );
};

export default convertMobilityEntries;
