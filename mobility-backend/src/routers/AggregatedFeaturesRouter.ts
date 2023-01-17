// import express, { Router } from 'express';
//
// import featureCollection from 'turf-featurecollection';
// import center from '@turf/center';
// import point from 'turf-point';
//
// import utmObj from 'utm-latlng';
//
// import MobilityEntryController from '../controllers/MobilityEntryController';
// import { MobilityEntryDAO } from '../types/MobilityEntry.js';
// import convertMobilityEntries from '../lib/convertMobilityEntries.js';
//
// const utm = new utmObj();
// const router = Router();
// const mobilityEntryController = new MobilityEntryController();
//
// router.use(express.json());
//
// /**
//  * @api {GET} /
//  * Get center points of aggregated MobilityFeatures. Each center point is calculated
//  * by all MobilityFeatures of an MobilityEntry.
//  *
//  * @apiSuccess {FeatureCollection} FeatureCollection with center points.
//  **/
// router.get('/', async (_, res) => {
//   const mobility_entries: MobilityEntryDAO[] =
//     await mobilityEntryController.get();
//
//   const mobilityEntries = await convertMobilityEntries(mobility_entries);
//
//   const centerPoints = mobilityEntries.map((mobilityEntry) => {
//     const features = mobilityEntry.mobilityFeatures.map((mobilityFeature) => {
//       return { type: 'feature', geometry: mobilityFeature.featureGeometry };
//     });
//     const centerPoint = center(featureCollection(features));
//     // Convert from EPSG:25832 (UTM zone 32N) to WGS84 projection
//     const { lat, lng } = utm.convertUtmToLatLng(
//       centerPoint.geometry.coordinates[0],
//       centerPoint.geometry.coordinates[1],
//       32,
//       'N'
//     );
//     return point([lng, lat]);
//   });
//
//   res.json(featureCollection(centerPoints));
// });
//
// export default router;
