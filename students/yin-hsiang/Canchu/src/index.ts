import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import "reflect-metadata";

import env from '../.env.json' assert { type: "json" };
// routes
import signup from './users/signup.js';
import signin from './users/signin.js';
import { getUserProfile, updateUserProfile } from './users/profile.js';
import changePicture from './users/picture.js';
// database
import { Database } from './db/data-source.js';

const app = express();
app.use(bodyParser.json());
const port = 3000;
const sql = mysql.createPool(env.sqlCfg);
const db = (await Database.initialize());

app.get('/', function (req, res) {
  res.send("Hello friend from the other side!");
})

app.post(`/api/${env.apiVer}/users/signup`, signup(db));
app.post(`/api/${env.apiVer}/users/signin`, signin(db));
app.get(`/api/${env.apiVer}/users/:id/profile`, getUserProfile(sql));
app.put(`/api/${env.apiVer}/users/profile`, updateUserProfile(sql));
app.use('/images', express.static('static/avatar'));
app.put(`/api/${env.apiVer}/users/picture`, changePicture(db));

app.listen(port, () => {
  console.log(`Canchu backend listening on port:${port}`);
})
