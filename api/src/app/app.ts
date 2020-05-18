import express from 'express';

import morgan from 'morgan';

import cookieparser from 'cookie-parser';
import bodyparser from 'body-parser';

import mongoose from 'mongoose';
import passport from 'passport';
import cors from 'cors';
import fileUpload from 'express-fileupload';

import UserRoute from './routes/user';
import VideoRoute from './routes/video';
import QueueRoute from './routes/queue';

import Response from './util/response';

import passportConfig from './config/passport';

export default class App {
    app = express();

    setup = () => {
        passportConfig(passport);
        this.app.use(passport.initialize());

        this.app.use(cors());

        this.app.use(morgan('dev'));

        this.app.use(cookieparser());

        this.app.use(bodyparser.json());
        this.app.use(bodyparser.urlencoded({ extended: false }));

        this.app.use(fileUpload({
          useTempFiles: true,
          tempFileDir: './temp/',
          limits: {
            files: 1,
          }
        }));

        this.app.use(UserRoute.init());
        this.app.use(VideoRoute.init());
        this.app.use(QueueRoute.init());

        /* Keep at End */
        /* or no routes will work */
        this.app.use(this.catch404);
        this.app.use(this.handleError);

        mongoose.connect(`mongodb://localhost/vod_${process.env.ENV}`, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }, (err) => {
            if (err) {
                console.log(err);
                process.abort();
            }
        });
        mongoose.set('useFindAndModify', false);
    };

    private catch404 = (req: any, res: any, next: any) => {
        const err: any = new Error('Not Found');
        err.status = 404;
        next(err);
    };

    private handleError = (err: any, req: any, res: any, next: any) => {
        res.status(err.status || 500);
        res.json(Response.getError(err));
        next();
    };
}
