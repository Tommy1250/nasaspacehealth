require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

const routes = require("./routes");

app.use("/", routes);

app.listen(process.env.PORT, () => {
    console.log(`listening on: ${process.env.PORT}`);
})
