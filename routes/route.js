const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.js');
const bcrypt = require('bcrypt');
const userSchema = require('../model/model.js');
const mongoose = require('mongoose')
const User = mongoose.model('User', userSchema);

router.post('/register', async(req, res) => {
  const { username, password, role } = req.body;
  const user = await User.findOne({ username });
  if (username=="" || password== "" || role=="") {
    res.status(401).json({ message: 'All fields are required' });
  }
if (user) {
    res.status(409).json({message:"user already existed"}) 
  }


  const hashedPassword = bcrypt.hashSync(password, 10);
  // Save the user to the database (this is just a placeholder, implement your own logic)
  const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save()
    .then(() => console.log('User saved'))
    .catch(err => console.log(err));
  // In a real application, you would save newUser to your database here)
  // For demonstration, we'll just return the new user object without the password
    res.status(201).json({ message: 'User registered successfully', user: { username: newUser.username, role: newUser.role } });
});


router.post('/login', async(req, res) => {
  const { username, password } = req.body;
    if (username=="" || password== "") {
    res.status(400).json({ message: 'All fields are required' });
    }
  
  const user = await User.findOne({ username });
  console.log(username);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid username' })};
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid password' })};

  const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ user: true, message: 'Login successful', token, username: user.username, role: user.role});
  
  });

router.get('/dashboard', authMiddleware, async (req, res) => {
    
    if(req.user.role === 'admin') {
      const allusers = await User.find({})
      res.status(200).json({ message: `dashbord`, allusers});
    } else{  res.status(403).json({ message: `admim only accessed the dashbord`});}

  });
  router.get('/profile', authMiddleware, (req, res) => {
    res.status(200).json({ message: `Welcome to your profile, ${req.user.username}!`, user: req.user });
  });

  router.get('users', authMiddleware, async (req, res) => {

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find({}, '-password'); // Exclude passwords
    res.status(200).json({ users });

  })

  module.exports = router;