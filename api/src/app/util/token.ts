import passport from 'passport';

export default class TokenUtil {
    static getToken = (headers: any): string | undefined => {
        if (headers && headers.authorization) {
            if (headers.authorization.split(' ').length === 2) {
                return headers.authorization.split(' ')[1];
            }
        }

        return undefined;
    }

    static getPassportAuth = passport.authenticate('jwt', { session: false, failWithError: true });
}
