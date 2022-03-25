import { AnnotationFeatureDTO } from '../types/AnnotationFeature';
import { FeatureDAO, FeatureType } from '../types/Feature';
import { MobilityFeatureDTO } from '../types/MobilityFeature';

/**
 * Converts FeatureDAO database objects to MobilityFeatureDTO and AnnotationFeatureDTO transmission objects
 * @param featureDAOs
 */
const convertFeatures = (
  featureDAOs: FeatureDAO[]
): {
  annotationFeatures: AnnotationFeatureDTO[];
  mobilityFeatures: MobilityFeatureDTO[];
} => {
  return featureDAOs.reduce(
    (features, featureDAO) => {
      // Required Properties
      let feature = {
        featureId: featureDAO.feature_id
      };
      // Optional Properties
      if (featureDAO.title) feature['title'] = featureDAO.title;
      if (featureDAO.start_time) feature['startTime'] = featureDAO.start_time;
      if (featureDAO.end_time) feature['endTime'] = featureDAO.end_time;
      if (featureDAO.cost) feature['cost'] = Number(featureDAO.cost);
      if (featureDAO.comment) feature['comment'] = featureDAO.comment;
      if (featureDAO.mobility_mode)
        feature['mobilityMode'] = featureDAO.mobility_mode;

      const finalFeature = {
        ...feature,
        // More Required Properties
        geometryIndex: featureDAO.geometry_index,
        featureGeometry: JSON.parse(featureDAO.feature_geometry)
      };

      if (featureDAO.feature_type.trim() === FeatureType.ANNOTATION) {
        features.annotationFeatures.push(finalFeature);
      } else if (featureDAO.feature_type.trim() === FeatureType.MOBILITY) {
        features.mobilityFeatures.push(finalFeature);
      }
      return features;
    },
    { annotationFeatures: [], mobilityFeatures: [] }
  );
};

export default convertFeatures;
