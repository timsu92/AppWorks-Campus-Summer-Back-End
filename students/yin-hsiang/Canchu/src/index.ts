import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';

import env from '../.env.json' assert { type: "json" };
import signup from './users/signup.js';
import signin from './users/signin.js';
import { getUserProfile, updateUserProfile } from './users/profile.js';
import changePicture from './users/picture.js';

const app = express();
app.use(bodyParser.json());
const port = 3000;
const sql = mysql.createPool(env.sqlCfg);

app.get('/', function (req, res) {
  res.send("Hello friend from the other side!");
})

app.post('/api/1.0/users/signup', signup(sql));
app.post('/api/1.0/users/signin', signin(sql));
app.get('/api/1.0/users/:id/profile', getUserProfile(sql));
app.put('/api/1.0/users/profile', updateUserProfile(sql));
app.put('/api/1.0/users/picture', changePicture(sql));

app.listen(port, () => {
  console.log(`Canchu backend listening on port:${port}`);
})
