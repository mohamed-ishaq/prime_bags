const express = require('express');
const { getAllReviews } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAllReviews);

module.exports = router;

