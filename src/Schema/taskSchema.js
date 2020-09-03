//const validator = require('validator');
const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: Boolean,
    default: false
  },
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users'    //db name
  }
},
  {
    timestamps : true
  });

taskSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject._id;
  delete userObject.ownerID;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.__v;
  return userObject
};

const taskModel = mongoose.model('tasks', taskSchema);
module.exports = taskModel;
