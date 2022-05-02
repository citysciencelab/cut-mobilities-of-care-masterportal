import { Router } from 'express';
import fileUpload from 'express-fileupload';

import ImageFileController from '../controllers/ImageFileController';

const ACCEPTED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/bmp': 'bmp',
  'image/png': 'png'
};

const imageFileController = new ImageFileController();
export const externalRouter = Router();

externalRouter.use(
  fileUpload({
    createParentPath: true
  })
);

/**
 * @api {POST} /
 * Add an AndioFile
 *
 * @apiBody {{entryId: MobilityEntryId}} MobilityEntryId to add image file to
 * @apiBody {{image: BLOB}} Binary image data
 *
 * @apiSuccess {HTTPStatusCode} 200
 **/
externalRouter.post('/', async (req, res) => {
  if (!req.body.entryId) {
    res.status(400).send('entryId is missing.');
    return;
  }

  try {
    // @ts-ignore
    const fileKeys = Object.keys(req.files);
    for (let i = 0; i < fileKeys.length; i++) {
      // @ts-ignore
      const file = req.files[fileKeys[i]];

      if (!Object.keys(ACCEPTED_MIME_TYPES).includes(file.mimetype)) {
        res.status(400).send('Invalid file MIME-Type.');
        return;
      }

      const fileExtension = ACCEPTED_MIME_TYPES[file.mimetype];

      await file.mv(`image_files/${file.name}.${fileExtension}`);

      await imageFileController.post(
        `image/${file.name}.${fileExtension}`,
        req.body.entryId
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export const internalRouter = Router();

/**
 * @api {GET} /
 * Get an image file
 *
 * @apiParam {String} Image file path
 *
 * @apiSuccess {File} The image file
 **/
internalRouter.get('/:image_file', function (req, res) {
  const file = `image_files/${req.params.image_file}`;
  res.download(file);
});
