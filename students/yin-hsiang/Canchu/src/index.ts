import express from 'express';
import bodyParser from 'body-parser';
import "reflect-metadata";
import cors from 'cors';

import env from '../.env.json' assert { type: "json" };
// routes
import signup from './users/signup.js';
import signin from './users/signin.js';
import { updateUserProfile } from './users/profile/update.js';
import { getUserProfile } from './users/profile/get.js';
import changePicture from './users/picture.js';
import searchUser from './users/search.js';

import friendRequest from './friends/request.js';
import friendAgree from './friends/agree.js';
import friendPending from './friends/pending.js';
import friendDelete from './friends/delete.js';
import friendGet from './friends/get.js';

import eventGet from './events/get.js';
import eventRead from './events/read.js';

import createPost from './posts/create.js';
import updatePost from './posts/update.js';
import { getPostDetail } from './posts/detail.js';
import { genCursor as genSearchCursor, listTargetUserId, searchPost } from './posts/search.js';

import { createLike, unlike } from './posts/like.js';

import { createComment } from './posts/comment.js';

// database
import { Database } from './db/data-source.js';
import { initDbCache } from './db/cache/common.js';
// utils
import { accessToken, userExist } from './users/auth.js';
import { jsonContentType, rateLimiter } from './util/util.js';

// global config
const corsOptions: cors.CorsOptions = {
  "origin": "https://" + env.frontendAddr,
  "methods": "GET,PUT,POST,DELETE",
  "allowedHeaders": ["Authorization", "Content-Type"]
}
const port = 3000;

//
const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions)); // handles all CORS on all routes and processes CORS pre-flight
await Database.initialize();
initDbCache();

app.use(new RegExp(`^(?!\/api\/${env.apiVer}\/users\/search).*`), rateLimiter()); // user search involves higher frequency of requests

app.get('/', function (req, res) {
  res.send("Hello friend from the other side!");
})

app.post(`/api/${env.apiVer}/users/signup`, signup);
app.post(`/api/${env.apiVer}/users/signin`, signin);
app.get(`/api/${env.apiVer}/users/:id/profile`, [accessToken, userExist], getUserProfile);
app.put(`/api/${env.apiVer}/users/profile`, [jsonContentType, accessToken], updateUserProfile);
app.use('/images', express.static('static/avatar'));
app.put(`/api/${env.apiVer}/users/picture`, changePicture);
app.get(`/api/${env.apiVer}/users/search`, rateLimiter(14), [accessToken, userExist], searchUser);

app.get(`/api/${env.apiVer}/friends`, [accessToken, userExist], friendGet);
app.post(`/api/${env.apiVer}/friends/:user_id/request`, [accessToken], friendRequest);
app.post(`/api/${env.apiVer}/friends/:friendship_id/agree`, [accessToken], friendAgree)
app.get(`/api/${env.apiVer}/friends/pending`, [accessToken], friendPending);
app.delete(`/api/${env.apiVer}/friends/:friendship_id`, [accessToken], friendDelete);

app.get(`/api/${env.apiVer}/events`, [accessToken, userExist], eventGet);
app.post(`/api/${env.apiVer}/events/:event_id/read`, [accessToken], eventRead);

app.post(`/api/${env.apiVer}/posts`, [jsonContentType, accessToken, userExist], createPost);
app.get(`/api/${env.apiVer}/posts/search`, [accessToken, userExist], genSearchCursor, listTargetUserId, searchPost);
app.put(`/api/${env.apiVer}/posts/:id`, [accessToken], updatePost);
app.get(`/api/${env.apiVer}/posts/:id`, [accessToken, userExist], getPostDetail);

app.post(`/api/${env.apiVer}/posts/:id/like`, [accessToken, userExist], createLike);
app.delete(`/api/${env.apiVer}/posts/:id/like`, [accessToken], unlike);

app.post(`/api/${env.apiVer}/posts/:id/comment`, [jsonContentType, accessToken, userExist], createComment);

app.listen(port, () => {
  console.log(`Canchu backend listening on port:${port}`);
})

export { app };
