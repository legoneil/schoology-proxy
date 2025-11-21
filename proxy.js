import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const SCHOOLGY_ICAL = "https://bolles.schoology.com/calendar/feed/ical/1733152889/6aedc0e5ff94926f1a3d690e7941f920/ical.ics";

app.get("/ical", async (req, res) => {
    try {
        const response = await fetch(SCHOOLGY_ICAL);
        const data = await response.text();

        res.send(data);
    } catch (err) {
        console.error("Error fetching Schoology iCal:", err);
        res.status(500).send("Failed to load Schoology iCal");
    }
});

app.listen(3000, () => {
    console.log("Proxy running at http://localhost:3000/ical");
});
