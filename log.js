const axios = require("axios");

const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJuaWtoaXRoYXZhZGxhbXVkaTBAZ21haWwuY29tIiwiZXhwIjoxNzU0MTE2ODg4LCJpYXQiOjE3NTQxMTU5ODgsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIyMzJmMDljYS03YTQ4LTQ3N2ItODQ2YS0yYjE0YTI5NjBhYWQiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJuaWtoaXRoYSIsInN1YiI6ImJiYzNlMDQxLTg3ZjItNDIwNS05NWU5LTgxMTk3ODRkZDRlZiJ9LCJlbWFpbCI6Im5pa2hpdGhhdmFkbGFtdWRpMEBnbWFpbC5jb20iLCJuYW1lIjoibmlraGl0aGEiLCJyb2xsTm8iOiIyMmtuMWE0Mmk2IiwiYWNjZXNzQ29kZSI6Inp1UGRrdyIsImNsaWVudElEIjoiYmJjM2UwNDEtODdmMi00MjA1LTk1ZTktODExOTc4NGRkNGVmIiwiY2xpZW50U2VjcmV0Ijoic0FyS3RReEp3U0dBdEpRYiJ9.c82-oVpbH6RMvTIoThFUCAUPwLvW4FyZFB28eA7By4s";

async function sendLog(serviceName, logLevel, moduleName, logMessage) {
    try {
        await axios.post("http://20.244.56.144/evaluation-service/logs", 
            {
            stack: serviceName,
            level: logLevel,
            package: moduleName,
            message: logMessage
        },
         {
            headers: { Authorization: `bearer ${AUTH_TOKEN}` }
        });
    } catch (error) {
        if (error.response) {
            console.error("Logging failed:", error.response.status, error.response.data);
        } else {
            console.error("Logging failed:", error.message);
        }
    }
}

function logHttpRequests(req, res, next) {
    sendLog("backend", "info", "routes", `${req.method} ${req.url} called`);
    next();
}

module.exports = { sendLog, logHttpRequests };
