const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const {User, validate} = require('../models/User');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/user', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password', 'phone']));
  const salt = await bcryptjs.genSalt(10);
  user.password = await bcryptjs.hash(user.password, salt);
  await user.save();

  try {

    const token = user.generateAuthToken();
  
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email','phone']));
    
  } catch(error) {
    return res.status(500).send('Something failed.');
  }
});

module.exports = router; 

