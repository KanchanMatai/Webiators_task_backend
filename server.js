const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const SignUpRoutes = require('./routes/SignUpRoutes');
require('dotenv').config(); 
const path = require('path');
const cors = require('cors'); // Import CORS middleware
const helmet = require('helmet');
const app = express();
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
  };
// Middleware
// app.use(helmet()); 
// app.use(
//     helmet({
//       crossOriginResourcePolicy: false,
//     })
//   );
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(bodyParser.json());
// app.use(cors()); // Use CORS middleware
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Database connection
mongoose.connect('mongodb://localhost:27017/webiators', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api', SignUpRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
