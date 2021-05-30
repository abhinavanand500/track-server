const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    dist: {
        type: Number,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: false,
    },
});

userSchema.pre("save", function (next) {
    const user = this;
    // console.log("User is ", user);
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

// password checking method down
userSchema.methods.comparePassword = function (candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, user.password, (err, isMatched) => {
            if (err) {
                return reject(err);
            }
            if (!isMatched) {
                return reject(false);
            }
            resolve(true);
        });
    });
};

mongoose.model("User", userSchema);
