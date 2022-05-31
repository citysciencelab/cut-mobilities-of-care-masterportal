import { Router } from 'express';
import fileUpload from 'express-fileupload';

import AudioFileController from '../controllers/AudioFileController';

const ACCEPTED_MIME_TYPES = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'mp4'
};

const audioFileController = new AudioFileController();
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
 * @apiBody {{entryId: MobilityEntryId}} MobilityEntryId to add audio file to
 * @apiBody {{audio: BLOB}} Binary audio data
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

      await file.mv(`audio_files/${file.name}.${fileExtension}`);

      await audioFileController.post(
        `audio/${file.name}.${fileExtension}`,
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
 * Get an audio file
 *
 * @apiParam {String} Audio file path
 *
 * @apiSuccess {File} The audio file
 **/
internalRouter.get('/:audio_file', function (req, res) {
  const file = `audio_files/${req.params.audio_file}`;
  res.download(file);
});
