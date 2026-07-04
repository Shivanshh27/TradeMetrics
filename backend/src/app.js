const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/trades', require('./routes/trades'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/strategies', require('./routes/strategies'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`TradeMetrics API running on port ${PORT}`));
