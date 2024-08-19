import { Router } from 'express';
import { UserControllers } from './auth.controller';

const router = Router();

router.post('/login', UserControllers.loginUser);

export const AuthRoutes = router;
