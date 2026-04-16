const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decision');

router.post('/create', decisionController.createDecision);
router.get('/all', decisionController.getAllDecisions);
router.post('/event', decisionController.addEvent);
router.post('/review', decisionController.addReview);

module.exports = router;