const express = require('express');
const cors = require('cors');
const traceId = require('./middleware/traceId');
const errorHandler = require('./middleware/errorHandler');

const app = express()

app.use(cors())
app.use(express.json())
app.use(traceId)

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' })
});


app.use(errorHandler)

module.exports = app;