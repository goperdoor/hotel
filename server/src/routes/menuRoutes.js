import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createMenuItem, listMenuItems, updateMenuItem, toggleMenuItem, deleteMenuItem } from '../controllers/menuController.js';

const router = Router();
router.post('/', auth(['owner']), createMenuItem);
router.get('/owner', auth(['owner']), listMenuItems); // owner list his own
router.get('/public/:hotelId', listMenuItems); // public menu for hotel
router.put('/:id', auth(['owner']), updateMenuItem);
router.patch('/:id/toggle', auth(['owner']), toggleMenuItem);
router.delete('/:id', auth(['owner']), deleteMenuItem);
export default router;
