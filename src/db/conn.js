const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1/registration").then(() =>console.log("Connected to MongoDB! wow"))
.catch((error) => console.error("Error connecting to MongoDB: ", error));