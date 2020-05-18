import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';

import User from '../models/user';
import Response from '../util/response';
import TokenUtil from '../util/token';

function registerUser(req: any, res: any, next: any) {
    if (!req.body.email || !req.body.password) {
        next(new Error('Please supply an email and/or password'));
    } else if(!req.body.display_name) {
      next(new Error('Please supply a display name'));
    } else {
        const user = new User({
            email: req.body.email,
            password: req.body.password,
            display_name: req.body.display_name,
        });

        user.save((err) => {
            if (err) {
                next(err);
            } else {
                res.json(Response.getMessage('User created successfully'));
            }
        });
    }
}

function loginUser(req: any, res: any, next: any) {
    if (!req.body.email || !req.body.password) {
        next({ message: 'Please supply an email and/or password', status: 401 });
    } else {
        User.findOne({ email: req.body.email }).select('+password').exec((err, user) => {
            if (err) {
                next(err);
            } else if (!user) {
                next({ message: 'Invalid email or password', status: 401 });
            } else {
                bcryptjs.compare(req.body.password, user.password, (error, isMatch) => {
                    if (error) next(err);
                    else if (isMatch) {
                        const result = user;
                        result.password = '';

                        const token = jwt.sign(result.toJSON(), process.env.SECRET || 'secret', {
                            expiresIn: 900,
                        });

                        res.json(Response.getMessage({
                            token: `JWT ${token}`,
                        }));
                    } else {
                        next({ message: 'Invalid email or password', status: 401 });
                    }
                });
            }
        });
    }
}

function testAuthRoute(req: any, res: any) {
    if (TokenUtil.getToken(req.headers)) {
        res.send(req.user);
    } else {
        res.send('no');
    }
}

export default class UserRoute {
    static init = () => {
        const router = express.Router();

        router.post('/user/register/', registerUser);
        router.post('/user/login/', loginUser);

        router.get('/test', TokenUtil.getPassportAuth, testAuthRoute);

        return router;
    }
}
