require("dotenv").config();
const express = require("express");
const app = express();

const config = require("./config.json");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

const routes = require("./routes");

app.use("/", routes);

app.listen(config.port, () => {
    console.log(`listening on: ${process.env.PORT}`);
    console.log(`http://localhost:${config.port}`);
})
