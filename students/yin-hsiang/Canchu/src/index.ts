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

import friendRequest from './friends/request.js';
import friendAgree from './friends/agree.js';
import friendPending from './friends/pending.js';
import friendDelete from './friends/delete.js';
import friendGet from './friends/get.js';

import eventGet from './events/get.js';
import eventRead from './events/read.js';

// database
import { Database } from './db/data-source.js';
// utils
import { accessToken, userExist } from './users/auth.js';

const app = express();
app.use(bodyParser.json());
const port = 3000;
const sql = mysql.createPool(env.sqlCfg);
await Database.initialize();

app.get('/', function (req, res) {
  res.send("Hello friend from the other side!");
})

app.post(`/api/${env.apiVer}/users/signup`, signup);
app.post(`/api/${env.apiVer}/users/signin`, signin);
app.get(`/api/${env.apiVer}/users/:id/profile`, getUserProfile(sql));
app.put(`/api/${env.apiVer}/users/profile`, updateUserProfile(sql));
app.use('/images', express.static('static/avatar'));
app.put(`/api/${env.apiVer}/users/picture`, changePicture);

app.get(`/api/${env.apiVer}/friends`, [accessToken, userExist], friendGet);
app.post(`/api/${env.apiVer}/friends/:user_id/request`, [accessToken], friendRequest);
app.post(`/api/${env.apiVer}/friends/:friendship_id/agree`, [accessToken], friendAgree)
app.get(`/api/${env.apiVer}/friends/pending`, [accessToken], friendPending);
app.delete(`/api/${env.apiVer}/friends/:friendship_id`, [accessToken], friendDelete);

app.get(`/api/${env.apiVer}/events`, [accessToken, userExist], eventGet);
app.post(`/api/${env.apiVer}/events/:event_id/read`, [accessToken], eventRead);

app.listen(port, () => {
  console.log(`Canchu backend listening on port:${port}`);
})
