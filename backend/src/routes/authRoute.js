import express from 'express'

const router = express.Router();
import { signup, login, getMe } from '../controller/authController.js'
// import { signupValidator, loginValidator } from '@/validators/authValidators';
import { protect } from '../middleware/authmiddleware.js';

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
