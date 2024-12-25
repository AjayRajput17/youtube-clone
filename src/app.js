import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";

// Initialize dotenv to load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({
    limit: "16kb",
}));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb",
}));


app.use(express.static("public"));

app.use(cookieParser());

// Routes
app.use("/api/v1/users",userRouter);


app.get("/test", (req, res) => {
    res.status(200).send("Test route works!");
});

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    res.status(404).json({
        error: "Resource not found (route not match)",
    });
});


// Example: http://localhost:8080/api/v1/users/register

export { app };
