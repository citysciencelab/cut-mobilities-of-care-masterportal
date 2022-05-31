import express, { Router } from 'express';

//@ts-ignore Path is correct for output folder
import { mobilityModes } from '../../../shared/constants/mobilityData.js';

import MobilityEntryController from '../controllers/MobilityEntryController';
import FeatureController from '../controllers/FeatureController';
import { MobilityFeatureDTO } from '../types/MobilityFeature.js';
import {
  MobilityEntryDAO,
  MobilityEntryDTO,
  MobilityEntryId
} from '../types/MobilityEntry.js';
import convertMobilityEntries from '../lib/convertMobilityEntries.js';
import MOBILITY_ENTRY_ERRORS from '../constants/errors.js';
import { AnnotationFeatureDTO } from '../types/AnnotationFeature.js';
import { FeatureType } from '../types/Feature.js';

const {
  ERROR_GEOMETRY_INDICES_NOT_UNIQUE,
  ERROR_NO_FEATURE_GEOMETRY,
  ERROR_NO_MOBILITY_FEATURES,
  ERROR_NO_ANNOTATION_FEATURES,
  ERROR_PERSON_ID_MISSING,
  ERROR_UNKNOWN_MOBILITY_TYPE
} = MOBILITY_ENTRY_ERRORS;

const mobilityEntryController = new MobilityEntryController();
const featureController = new FeatureController();

export const externalRouter = Router();

externalRouter.use(express.json());

const postMobilityFeatures = async (
  mobilityFeatures: MobilityFeatureDTO[],
  entryId: MobilityEntryId
) => {
  const mobility_geometry_indices = [];

  for (let i = 0; i < mobilityFeatures.length; i++) {
    const mobilityFeature = mobilityFeatures[i];

    // GeometryIndex must be unique
    if (mobility_geometry_indices.includes(mobilityFeature.geometryIndex)) {
      throw ERROR_GEOMETRY_INDICES_NOT_UNIQUE;
    }

    // Valid mobilityMode is required
    if (!Object.values(mobilityModes).includes(mobilityFeature.mobilityMode)) {
      throw ERROR_UNKNOWN_MOBILITY_TYPE;
    }
    // FeatureGeometry must not be empty
    if (
      !mobilityFeature.featureGeometry ||
      !Object.keys(mobilityFeature.featureGeometry).length
    ) {
      throw ERROR_NO_FEATURE_GEOMETRY;
    }

    await featureController.post(
      entryId,
      mobilityFeature,
      FeatureType.MOBILITY
    );
    mobility_geometry_indices.push(mobilityFeature.geometryIndex);
  }
};

const postAnnotationFeatures = async (
  annotationFeatures: AnnotationFeatureDTO[],
  entryId: MobilityEntryId
) => {
  const annotation_geometry_indices = [];

  for (let i = 0; i < annotationFeatures.length; i++) {
    const annotationFeature = annotationFeatures[i];
    // GeometryIndex must be unique
    if (annotation_geometry_indices.includes(annotationFeature.geometryIndex)) {
      throw ERROR_GEOMETRY_INDICES_NOT_UNIQUE;
    }

    // FeatureGeometry must not be empty
    if (
      !annotationFeature.featureGeometry ||
      !Object.keys(annotationFeature.featureGeometry).length
    ) {
      throw ERROR_NO_FEATURE_GEOMETRY;
    }

    const featureId = await featureController.post(
      entryId,
      annotationFeature,
      FeatureType.ANNOTATION
    );
    annotationFeature.featureId = featureId;
    annotation_geometry_indices.push(annotationFeature.geometryIndex);
  }

  return annotationFeatures;
};

/**
 * @api {POST} /
 * Add an MobilityEntry
 *
 * @apiBody {MobilityEntryDTO} MobilityEntry to add
 *
 * @apiSuccess {MobilityEntryId} Id of added MobilityEntry
 **/
externalRouter.post('/', async (req, res) => {
  const mobilityFeatures: MobilityFeatureDTO[] = req.body.mobilityFeatures;
  const annotationFeatures: AnnotationFeatureDTO[] =
    req.body.annotationFeatures;
  const mobilityEntry: MobilityEntryDTO = req.body;
  let entryId: MobilityEntryId;

  try {
    // PersonId is required to attach MobilityEntry to a person
    if (!mobilityEntry.personId) {
      throw ERROR_PERSON_ID_MISSING;
    }

    // MobilityFeatures must be se
      // if (!mobilityFeatures || !mobilityFeatures.length) {
      //   throw ERROR_NO_MOBILITY_FEATURES;
      // }

    // AnnotationFeatures must be se
      if (!annotationFeatures || !annotationFeatures.length) {
          throw ERROR_NO_ANNOTATION_FEATURES;
      }

    entryId = await mobilityEntryController.post(mobilityEntry);

    // await postMobilityFeatures(mobilityFeatures, entryId);

    const annotationFeaturesWithId = await postAnnotationFeatures(annotationFeatures, entryId);
    res.status(200).json( annotationFeaturesWithId );
  } catch (error) {
    // Rollback if entry has already been inserted
    if (entryId) {
      await mobilityEntryController.delete(Number(entryId));
    }

    if (Object.values(MOBILITY_ENTRY_ERRORS).includes(error)) {
      res.status(400).send(error);
    } else {
      console.error(error);
      res.sendStatus(500);
    }
  }
});

export const internalRouter = Router();

internalRouter.use(express.json());

/**
 * @api {GET} /
 * Get all MobilityEntries
 *
 * @apiSuccess {MobilityEntryDTO[]} All MobilityEntries
 **/
internalRouter.get('/', async (_, res) => {
  const mobility_entries: MobilityEntryDAO[] =
    await mobilityEntryController.get();

  res.json(await convertMobilityEntries(mobility_entries));
});

/**
 * @api {GET} /delete
 * Delete an MobilityEntry
 *
 * @apiParam {MobilityEntryId} Id of MobilityEntry to delete
 *
 * @apiSuccess {HTTPStatusCode} 200
 **/
internalRouter.get('/delete/:entryId', async (req, res) => {
  const { entryId } = req.params;
  try {
    if (!entryId || isNaN(Number(entryId))) {
      res.sendStatus(400);
      return;
    }
    await mobilityEntryController.delete(Number(req.params.entryId));
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
