import { Router } from 'express';
import { adminLogin, ownerLogin } from '../controllers/authController.js';

const router = Router();
router.post('/admin/login', adminLogin);
router.post('/owner/login', ownerLogin);
export default router;
