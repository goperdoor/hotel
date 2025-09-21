import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createOrder, listOrdersForOwner, updateOrderStatus, getOrder, deleteOrder, getOrderByNumber } from '../controllers/orderController.js';

const router = Router();
router.post('/', createOrder); // public create order
router.get('/owner', auth(['owner']), listOrdersForOwner);
router.patch('/:id/status', auth(['owner']), updateOrderStatus);
router.delete('/:id', auth(['owner']), deleteOrder);
router.get('/number/:number', getOrderByNumber); // public lookup by order number
router.get('/:id', getOrder); // public tracking by id
export default router;
