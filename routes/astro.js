const express = require("express");
const { randomUUID } = require("crypto");

const { userExist, getCookie } = require("../functions/user");

const fs = require("fs");
const path = require("path");

const router = express.Router();

if (!fs.existsSync(path.join(__dirname, "..", "database", "astro"))) fs.mkdirSync(path.join(__dirname, "..", "database", "astro"));

function auth(req, res, next) {
    if (!userExist) return res.status(400).send({ msg: "Bad call no prior auth" });
    next();
}

router.get("/health", auth, (req, res) => {
    let astroId = getCookie(req.headers.cookie, "session");

    if (req.body && req.body.astroId) astroId = req.body.astroId;

    const astroDataLocation = path.join(__dirname, "..", "database", "astro", `${astroId}.json`);
    if (!fs.existsSync(astroDataLocation))
        fs.writeFileSync(
            astroDataLocation,
            JSON.stringify({
                bpm: Math.floor(Math.floor(Math.random() * (200 - 60 + 1)) + 60), // bpm
                spo2: Math.floor(Math.floor(Math.random() * (100 - 90 + 1)) + 90), // percent
                temp: Math.floor(Math.floor(Math.random() * (40 - 35 + 1)) + 35), // degree cel
                sleep: Math.floor(Math.floor(Math.random() * (10 - 6 + 1)) + 6), // hours
                hydration: Math.floor(Math.floor(Math.random() * (100 - 40 + 1)) + 40), // percent
                radiation: Math.floor(Math.floor(Math.random() * (40000 - 0 + 1)) + 0), // divide be 10k mSv
            }),
        );

    res.send(JSON.parse(fs.readFileSync(astroDataLocation, "utf-8")));
});

router.post("/health/edit", auth, (req, res) => {
    if (!req.body) {
        return res.status(400).send({ msg: "No body" });
    }

    const astroId = getCookie(req.headers.cookie, "session");
    const astroDataLocation = path.join(__dirname, "..", "database", "astro", `${astroId}.json`);
    const astroHealthData = JSON.parse(fs.readFileSync(astroDataLocation, "utf-8"));

    if (req.body.bpm) astroHealthData.bpm = req.body.bpm;
    if (req.body.spo2) astroHealthData.spo2 = req.body.spo2;
    if (req.body.temp) astroHealthData.temp = req.body.temp;
    if (req.body.sleep) astroHealthData.sleep = req.body.sleep;
    if (req.body.hydration) astroHealthData.hydration = req.body.hydration;
    if (req.body.radiation) astroHealthData.radiation = req.body.radiation;
    
    fs.writeFileSync(astroDataLocation, JSON.stringify(astroHealthData));
    res.status(200).send({ "msg": "editedData", astroHealthData });
});

module.exports = router;
