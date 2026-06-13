const express = require ('express');

const db = require('./Database');

const app = express();
app.use(express.json());

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));


