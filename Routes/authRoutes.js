import express from 'express';
import { logOut, login, registered } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', registered);
authRouter.post('/login', login);
authRouter.post('/logout', logOut);

export default authRouter;
