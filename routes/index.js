const router = require("express").Router();
const path = require("path");

const {userExist} = require("../functions/user");

router.get("/", (req, res) => {
    if (userExist(req.headers.cookie)) res.sendFile(path.join(__dirname, "..", "views", "index.html"));
    else res.redirect("/login");
});

router.get("/login", (req, res) => {
    if (userExist(req.headers.cookie)) res.redirect("/"); 
    else res.sendFile(path.join(__dirname, "..", "views", "login.html"));
})

// const api = require('./api');
// router.use('/api', api);

const auth = require("./auth");
router.use("/auth", auth);

router.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "..", "views", "404.html"));
});

module.exports = router;
