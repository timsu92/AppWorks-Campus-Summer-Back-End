import express from 'express';

const app = express();
const port = 3000;

app.get('/', function (req, res) {
	res.send("Hello, My Server!\nReturned from localhost~");
})

app.listen(port, () => {
	console.log(`Example app listening on localhost:${port}`);
})
