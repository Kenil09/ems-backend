const router = require('express').Router();
const Leave = require('../controllers/Leave');

// router.post('/addtempleave',Leave.templeave);
router.post('/applyleave',Leave.ApplyForLeave);
router.get('/getLeaves',Leave.getAllLeaves);

module.exports = router;