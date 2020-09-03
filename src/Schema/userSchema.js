const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid Email Address')
        }
      }
    },
    password:
      {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
          if (value.includes('password')) {
            throw new Error(`Password can't be password`)
          }
        }
      },
    age: {
      type: Number,
      validate(value) {
        if (value < 0) {
          throw new Error('Age should be greater than 0')
        }
      }
    },
    tokens: [{
      token: {
        type: String,
        required: true
      }
    }],
    profile : {
      type:Buffer
    }
  },
  {
    timestamps : true
  } );
//METHODS are access able on Instances (currentUser of userRouter)
userSchema.methods.generateAuthToken = async function () {
  let token = jsonwt.sign({_id: this._id.toString()},process.env.JWT_SECRET_KEY);
  this.tokens = this.tokens.concat({token});
  await this.save();
  return token
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject._id;
  delete userObject.__v;
  delete userObject.profile;
  return userObject
};

userSchema.virtual('mytasks', {
  ref: 'tasks',
  localField: '_id',
  foreignField: 'ownerID'
});


//STATICS methods are access able on model (userModel)
userSchema.statics.LOGINCredentials = async (email, password) => {
  const currentUser = await userModel.findOne({email});
  if (currentUser === null) {
    throw new Error('Unable to LOGIN(01)')
  }
  const isMatch = await bcrypt.compare(password, currentUser.password);
  if (!isMatch) {
    throw new Error('Unable to LOGIN(02)')
  }
  return currentUser;
};

// PRE runs before storing values into database
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});


let userModel = mongoose.model('users', userSchema);
module.exports = userModel;
