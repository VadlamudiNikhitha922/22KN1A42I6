const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const { Log, requestLogger} = require("./log.js");

app.use(express.json());
app.use(requestLogger);

let urlStore = {};
app.post("/shorturls", (req, res) => {
    const { url, validity, shortcode } = req.body;

    if (!url) {
        Log("backend", "error", "controller", "missing url inrequest");
        return res.status(400).json({ error: "url is required" });
    }
    let code = shortcode || uuidv4().slice(0, 6);
    if (urlStore[code]) {
        Log("backend", "warn", "controller", `shortcode ${code} alreadyexists`);
        return res.status(400).json({ error: "shortcode already exists" });
    }
    const expiryTime = new Date(Date.now() + (validity || 30) * 60 * 1000);

    urlStore[code] = {
        url,
        expiry: expiryTime.toISOString(),
        createdAt: new Date().toISOString(),
        clicks: 0,
        clickData: []
    };

    Log("backend", "info", "controller", `Short URL created for ${url}`);
    res.status(201).json({
        shortLink: `http://localhost:3000/${code}`,
        expiry: expiryTime.toISOString()
    });
});

app.get("/:shortcode", (req, res) => {
    const code = req.params.shortcode;
    const data = urlStore[code];
    if (!data) {
         Log("backend", "error", "controller",`Shortcode ${code} not found`);
        return res.status(404).json({ error: "Shortcode not found" });
    }if (new Date(data.expiry) < new Date()) {
        delete urlStore[code];
        Log("backend", "warn", "controller", `Short URL ${code} expired`);
        return res.status(410).json({ error: "Short URL expired" });
    }
    data.clicks += 1;
    data.clickData.push({
        timestamp: new Date().toISOString(),
        referrer: req.get("referer") || "direct",
        ip: req.ip
    });
    Log("backend", "info", "controller",` Redirecting to ${data.url}`);
    res.redirect(data.url);
});

app.get("/shorturls/:shortcode/stats", (req, res) => {
    const code = req.params.shortcode;
    const data = urlStore[code];

    if (!data) {
        Log("backend", "error", "controller", `Stats requested for invalid shortcode ${code}`);
        return res.status(404).json({ error: "Shortcode not found" });
    }

    Log("backend", "info", "controller",` Statsrequested for shortcode ${code}`);
    res.json({
        shortLink: `http://localhost:3000/${code}`,
        originalUrl: data.url,
        createdAt: data.createdAt,
        expiry: data.expiry,
        totalClicks: data.clicks,
        clickData: data.clickData
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});