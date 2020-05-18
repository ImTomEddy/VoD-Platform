import mongoose from 'mongoose';

import bcryptjs from 'bcryptjs';

import validator from 'validator';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    display_name: {
      type: String,
      required: true,
    },
    __v: {
        type: Number,
        select: false,
    },
});

interface IUser extends mongoose.Document {
    email: string,
    password: string,
    display_name: string
}

UserSchema.pre<IUser>('save', function (next) {
    if (this.isModified('password') || this.isNew) {
        bcryptjs.genSalt(10, (err, salt) => {
            if (err) next(err);
            else {
                bcryptjs.hash(this.password, salt, (error, result) => {
                    if (error) next(error);
                    this.password = result;
                    next();
                });
            }
        });
    } else {
        next();
    }
});

UserSchema.methods.comparePassword = function (password: string, callback: any) {
    bcryptjs.compare(password, this.password, (err, isMatch) => {
        if (err) callback(err);
        else callback(undefined, isMatch);
    });
};

export default mongoose.model<IUser>('User', UserSchema);
