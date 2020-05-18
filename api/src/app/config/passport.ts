import passportJWT from 'passport-jwt';

import User from '../models/user';

const extract = passportJWT.ExtractJwt;

const passportConfig = (passport: any) => {
    const options = {
        jwtFromRequest: extract.fromAuthHeaderWithScheme('jwt'),
        secretOrKey: process.env.secret || 'secret',
    };

    passport.use(new passportJWT.Strategy(options, (payload, done) => {
        User.findOne({ _id: payload._id }, (err, user) => {
            if (err) {
                done(err, false);
            } else if (user) {
                done(undefined, user);
            } else {
                done(undefined, false);
            }
        });
    }));
};

export default passportConfig;
