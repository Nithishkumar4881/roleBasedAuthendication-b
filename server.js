const express = require('express');
const router = require('./routes/route.js')
const app = express();
const port = 8000;
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');


app.use(cors());
app.use(express.json());
const mongodb = process.env.MONGO;//
mongoose.connect(`${process.env.MONGO}/authdb`)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


app.use('', router)
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});