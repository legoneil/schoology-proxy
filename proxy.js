import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// 🔹 Serve the front-end files
app.use(express.static(__dirname));

// 🔹 Your Schoology iCal link
const SCHOOLGY_ICAL = "https://bolles.schoology.com/calendar/feed/ical/1733152889/6aedc0e5ff94926f1a3d690e7941f920/ical.ics";

// 🔹 Proxy endpoint for iCal
app.get("/ical", async (req, res) => {
    try {
        const response = await fetch(SCHOOLGY_ICAL);
        const data = await response.text();

        res.set("Content-Type", "text/calendar");
        res.send(data);
    } catch (err) {
        console.error("Error fetching Schoology iCal:", err);
        res.status(500).send("Failed to load Schoology iCal");
    }
});

// 🔹 Root route → serve your index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 🔹 Render will set PORT automatically
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Schoology Proxy running on port ${PORT}`);
});
