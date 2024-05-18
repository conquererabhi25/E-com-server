const mongoose = require('mongoose')
// mongoose.connect("mongodb://localhost:27017/e-commerce")   // this is to connect MONDODB compass

// Following Code is to connect application to MongoDb ATLAS.  Check password string special characters must be encoded.

mongoose.connect('mongodb+srv://abhijeetkoli25:Vega%40ris2599@cluster0.xzcorzh.mongodb.net/e-commerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.error('Error connecting to MongoDB Atlas:', error);
});

