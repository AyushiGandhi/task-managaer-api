require('./db/dbConnection_mongoose');   //To start up database connection
const express = require('express');
const userRouters = require('./Routers/userRouter');
const taskRouters = require('./Routers/taskRouter');

const app = express();
const port = process.env.PORT;

app.use(express.json());  // converts json file to object automatically
app.use(userRouters);
app.use(taskRouters);

app.listen(port, () => {
  console.log('Server is Working! :', port)
});



