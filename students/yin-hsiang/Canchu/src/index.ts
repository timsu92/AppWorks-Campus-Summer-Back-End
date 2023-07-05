import express from 'express';
import bodyParser from 'body-parser';

import signup from './account/signup';

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.get('/', function (req, res) {
  res.send("Hello friend from the other side!");
})

app.post('/users/signup', signup);

app.listen(port, () => {
  console.log(`Canchu backend listening on port:${port}`);
})
