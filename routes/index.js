const router = require("express").Router();
const path = require("path");

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "index.html"));
})

// const api = require('./api');
// router.use('/api', api);

router.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "..", "views", "404.html"))
})

module.exports = router;