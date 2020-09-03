const express = require('express');
const router = new express.Router();
const taskModel = require('../Schema/taskSchema');
const auth = require('../middleware/authentication');


/* ---------------------------//POST METHOD FOR TASKS------------------------------------------  */
router.post('/tasks', auth, async (req, res) => {
  try {
    let taskResult = await taskModel.create({...req.body, ownerID: req.authUser._id});
    res.send(taskResult)
  } catch (error) {
    res.status(400).send(error)
  }
});

/* -----------------------------//GET METHOD FOR TASKS-------------------------------------------  */
//ALL TASKS FOR ***TESTING***
router.get('/tasks', async (req, res) => {
  try {
    let taskResult = await taskModel.find({});
    res.send(taskResult)
  } catch (error) {
    res.status(500).send(error)
  }
});
// AUTHENTICATED CURRENT USER TASKS (MYSELF)
router.get('/tasks/myself', auth, async (req, res) => {
  try {
    let parts = '';
    let searchDetails = {ownerID: req.authUser._id};
    if (req.query.status) searchDetails = {...searchDetails, status: req.query.status};
    if (req.query.sortBy) {
      parts = req.query.sortBy.split('_');
      parts = [[parts[0], parts[1] = parts[1] === 'asc' ? 1 : -1]];
    }

    let taskResult = await taskModel.find(searchDetails, null, {
      limit: parseInt(req.query.limit),
      skip: parseInt(req.query.skip)
    }).sort(parts);

    if (taskResult.length === 0) {
      return res.status(400).send('User Task Does Not Exists')
    }
    res.send(taskResult)
  } catch (error) {
    res.status(400).send('Error400 Bad Request')
  }
});

router.get('/tasks/id/:id', auth, async (req, res) => {
  try {
    let taskResult = await taskModel.findOne({_id: req.params.id, ownerID: req.authUser._id});
    if (taskResult.length === 0) {
      return res.status(400).send('User Task Does Not Exists')
    }
    res.send(taskResult)
  } catch (error) {
    res.status(400).send('Error400 Bad Request')
  }
});

/*-------------------------//PATCH METHOD FOR USERS--------------------------------------------*/
router.patch('/tasks/:id', auth, async (req, res) => {
  try {
    let updates = Object.keys(req.body);
    let allowedUpdates = ['description', 'status'];
    let isValid = updates.every(keys => allowedUpdates.includes(keys));
    if (!isValid) {
      return res.status(400).send('Check The Keys of Object which is used to update')
    }
    let task = await taskModel.findOne({_id: req.params.id, ownerID: req.authUser._id});
    updates.forEach(keys => task[keys] = req.body[keys]);
    await task.save();
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
});

/* -------------------------//DELETE METHOD FOR USERS--------------------------------------------*/
router.delete('/tasks/', auth, async (req, res) => {
  try {
    let task = await taskModel.deleteMany({ownerID: req.authUser._id});
    res.send('All Tasks are Deleted! ')
  } catch (e) {
    res.status(400).send(e)
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    let task = await taskModel.findOne({_id: req.params.id, ownerID: req.authUser._id});
    await task.remove();
    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
});

module.exports = router;
