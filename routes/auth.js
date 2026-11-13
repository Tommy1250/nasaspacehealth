const express = require("express");
const { randomUUID } = require("crypto");

const { userExist, getCookie } = require("../functions/user");

const fs = require("fs");
const path = require("path");

const router = express.Router();
// router.get("/logout", (req, res) => {
//     // مسح الكوكي من المتصفح فقط دون المساس بملف users.json
//     res.clearCookie("session");
//     res.redirect("/login");
// });
router.post("/login", (req, res) => {
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "database", "users.json"), "utf-8"));
    
    if (userExist(req.headers.cookie))
        return res.status(200).send({
            msg: "exist",
            username: users[getCookie(req.headers.cookie, "session")]
        });

    const user = randomUUID();

    let username = `User-${Math.floor(Math.random() * 10000)}`;
    if(req.body && req.body.username)
        username = req.body.username;

    res.cookie("session", user).status(201).json({ username });

    users[user] = username;
    fs.writeFileSync(path.join(__dirname, "..", "database", "users.json"), JSON.stringify(users));
});

module.exports = router;
