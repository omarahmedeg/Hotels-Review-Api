const express = require('express');
const cors = require('cors');
require('dotenv').config();
const router = require('./routes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/hotels', router);

const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log('listening on port', port);
})
