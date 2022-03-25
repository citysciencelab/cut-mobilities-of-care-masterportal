import express, { Router } from 'express';
import FeatureController from '../controllers/FeatureController';
import convertFeatures from '../lib/convertFeatures';

const router = Router();
const featureController = new FeatureController();

router.use(express.json());

/**
 * @api {GET} /
 * Get all MobilityFeatures
 *
 * @apiSuccess {MobilityFeatureDTO[]} All MobilityFeatures
 **/
router.get('/', async (_, res) => {
  const mobilityFeatures = await featureController.get();
  res.json(convertFeatures(mobilityFeatures).mobilityFeatures);
});

/**
 * @api {GET} /
 * Get an MobilityFeature
 *
 * @apiParam {MobilityFeatureId} Id of MobilityFeature to fetch
 *
 * @apiSuccess {MobilityFeatureDTO} The MobilityFeature
 **/
router.get('/:featureId', async (req, res) => {
  const mobilityFeatures = await featureController.get(
    Number(req.params.featureId)
  );
  res.json(convertFeatures(mobilityFeatures).mobilityFeatures);
});

export default router;
