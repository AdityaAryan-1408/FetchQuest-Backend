// File: fetchquest-server/routes/requestRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
    createRequest,
    getAllRequests,
    acceptRequest,
    deleteRequest,
    rateUser,
    getMyRequests,
    getMyRuns,
    completeRequest,
    cancelRequest,
    getQuestContact 
} = require('../controllers/requestController');

router.post('/', authMiddleware, createRequest);
router.get('/', getAllRequests);
router.patch('/:id/accept', authMiddleware, acceptRequest);
router.delete('/:id', authMiddleware, deleteRequest);
router.post('/:id/rate', authMiddleware, rateUser);
router.get('/my-requests', authMiddleware, getMyRequests);
router.get('/my-runs', authMiddleware, getMyRuns);
router.patch('/:id/complete', authMiddleware, completeRequest);
router.patch('/:id/cancel', authMiddleware, cancelRequest);


router.get('/:id/contact', authMiddleware, getQuestContact);

module.exports = router;