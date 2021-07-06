const express = require("express");
const mongoose = require("mongoose");
const unirest = require("unirest");
const requireAuth = require("../middlewares/requireAuth");
const Track = mongoose.model("Track");

const router = express.Router();
router.use(requireAuth);

router.get("/getdetails", async (req, res) => {
    console.log("Hiii user info", req.user);
    res.send(req.user);
});

router.get("/tracks", async (req, res) => {
    console.log("Req is ", req.user);
    const tracks = await Track.find({ userId: req.user._id });
    res.send(tracks);
});

router.post("/tracks", async (req, res) => {
    const { name, locations } = req.body;
    if (!name || !locations) {
        return res
            .status(422)
            .send({ error: "You must provide a name and location" });
    }
    try {
        const track = new Track({ name, locations, userId: req.user._id });
        await track.save();
        res.send(track);
    } catch (err) {
        res.status(422).send({ error: err.message });
    }
});

router.post("/sendMessage", async (req, res) => {
    // const lat = req.body.currentLocation.coords.latitude;
    // const long = req.body.currentLocation.coords.longitude;
    const dist = req.body.dist;

    const API =
        "pJ1UjN0nVPm4Tl7tWHC3xoXgqf96zSiQ8cMDdsIyReZEwvBKaLpyo9OcuFq0NWSmCQnx526ZGAs8rThb";
    const link =
        "http://www.google.com/maps/place/" +
        req.body.currentLocation.coords.latitude +
        "," +
        req.body.currentLocation.coords.longitude;
    const re = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");

    re.headers({
        authorization: API,
    });

    re.form({
        message:
            "The patient is outside safe area. The distance between starting position and his current location is : " +
            dist +
            " km. You can track the patient's location using following link " +
            link,
        language: "english",
        route: "q",
        numbers: req.user.phone,
    });

    re.end(function (res) {
        if (res.error) throw new Error(res.error);

        console.log("Why", res.body);
    });
});

module.exports = router;
