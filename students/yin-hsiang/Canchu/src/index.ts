import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';

import env from '../.env.json' assert { type: "json" };
import signup from './account/signup.js';

const app = express();
app.use(bodyParser.json());
const port = 3000;
const sql = mysql.createConnection(env.sqlOp);
sql.connect();

app.get('/', function (req, res) {
  res.send("Hello friend from the other side!");
})

app.post('/users/signup', signup(sql));

app.listen(port, () => {
  console.log(`Canchu backend listening on port:${port}`);
})
