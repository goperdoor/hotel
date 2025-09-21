import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createHotel, listHotels, updateHotel, toggleHotelActive, deleteHotel, publicActiveHotels, getHotel } from '../controllers/hotelController.js';

const router = Router();
// admin protected
router.post('/', auth(['admin']), createHotel);
router.get('/', auth(['admin']), listHotels);
router.put('/:id', auth(['admin']), updateHotel);
router.patch('/:id/toggle', auth(['admin']), toggleHotelActive);
router.delete('/:id', auth(['admin']), deleteHotel);
// public
router.get('/public', publicActiveHotels);
router.get('/public/:id', getHotel);

export default router;
