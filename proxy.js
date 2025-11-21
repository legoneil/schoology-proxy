import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const SCHOOLGY_ICAL =
  "https://bolles.schoology.com/calendar/feed/ical/1733152889/6aedc0e5ff94926f1a3d690e7941f920/ical.ics";

// Root route (optional)
app.get("/", (req, res) => {
  res.send("Schoology Proxy is running!");
});

// ICS proxy route
app.get("/ical", async (req, res) => {
  try {
    const response = await fetch(SCHOOLGY_ICAL);
    const data = await response.text();

    res.set("Content-Type", "text/calendar; charset=utf-8");
    res.send(data);
  } catch (err) {
    console.error("Error fetching Schoology iCal:", err);
    res.status(500).send("Failed to load Schoology iCal");
  }
});

// IMPORTANT: Use Render’s port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
