const router = require('express').Router();
const Leave = require('../controllers/Leave');

// router.post('/addtempleave',Leave.templeave);
router.post('/applyleave',Leave.applyLeave);
router.post('/approveleave/:leaveId',Leave.approveLeave);
router.post('/cancelledleave/:leaveId',Leave.cancelledLeave);
router.get('/',Leave.getAllLeaves);
router.get('/:userId',Leave.getUserLeaves);
router.get('/typesLeave/:userId',Leave.getAvailableLeaves)

module.exports = router;