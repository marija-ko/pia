const mongoose = require('mongoose')

mongoose.connect(
    process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
      if (err) {
        console.error(
          "Database-Connection failed."
        );
      } else {
        console.info("Database-Connection success.");
      }
    }
  );
  
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'database connection error:'));

 // require('./user')