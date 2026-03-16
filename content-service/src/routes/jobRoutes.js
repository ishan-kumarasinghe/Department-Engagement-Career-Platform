const express = require('express');
const {
  applyToJob,
  createJob,
  getJobApplications,
  listJobs
} = require('../controllers/jobController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth);
router.get('/', asyncHandler(listJobs));
router.post('/', requireRole('alumni', 'admin'), asyncHandler(createJob));
router.post('/:jobId/apply', requireRole('student'), asyncHandler(applyToJob));
router.get('/:jobId/applications', asyncHandler(getJobApplications));

module.exports = router;
