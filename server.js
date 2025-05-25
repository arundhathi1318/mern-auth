import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from './Routes/authRoutes.js';

const app = express();
const port = process.env.port || 3000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));

app.get('/', (req, res) => {
    res.send("This is a MERN-AUTH Signup-Login");
});

app.use('/api/auth', authRouter); // ✅ FIXED LINE

app.listen(port, () =>
    console.log(`Server started on port: ${port}`)
);
