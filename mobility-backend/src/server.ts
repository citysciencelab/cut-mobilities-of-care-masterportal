import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
  externalRouter as externalMobilityEntryRouter,
  internalRouter as internalMobilityEntryRouter
} from './routers/MobilityEntryRouter';
import mobilityFeatureRouter from './routers/MobilityFeatureRouter';
import {
  externalRouter as externalAudioFileRouter,
  internalRouter as internalAudioFileRouter
} from './routers/AudioFileRouter';
import {
  externalRouter as externalImageFileRouter,
  internalRouter as internalImageFileRouter
} from './routers/ImageFileRouter';
// import aggregatedFeaturesRouter from './routers/AggregatedFeaturesRouter';
import {
  externalRouter as externalPersonRouter,
  internalRouter as internalPersonRouter
} from './routers/PersonRouter';
import pool from './dbconfig/dbconnector';

class Server {
  private app;

  constructor() {
    this.app = express();
    this.config();
    this.routerConfig();
    this.dbConnect();
  }

  private config() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json({ limit: '1mb' })); // 100kb default
    this.app.use(
      cors({
        methods: ['GET', 'POST'],
        origin: '*'
      })
    );
  }

  private dbConnect() {
    pool.connect(function (err, client, done) {
      if (err) throw new Error(err);
      console.log('Connected');
    });
  }

  private routerConfig() {
    if (process.env.API_VARIANT === 'internal') {
      this.app.use('/person', internalPersonRouter);

      this.app.use('/entry', internalMobilityEntryRouter);

      this.app.use('/audio', internalAudioFileRouter);

      this.app.use('/image', internalImageFileRouter);

      this.app.use('/feature', mobilityFeatureRouter);
    } else {
      this.app.use('/person', externalPersonRouter);

      this.app.use('/entry', externalMobilityEntryRouter);

      this.app.use('/audio', externalAudioFileRouter);

      this.app.use('/image', externalImageFileRouter);
    }

    // this.app.use('/aggregated', aggregatedFeaturesRouter);
  }

  public start = (port: number) => {
    return new Promise((resolve, reject) => {
      this.app
        .listen(port, () => {
          resolve(port);
        })
        .on('error', (err: Object) => reject(err));
    });
  };
}

export default Server;
