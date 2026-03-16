const express = require('express');
const {
  addComment,
  createPost,
  getFeed,
  likePost,
  unlikePost
} = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth);
router.get('/', asyncHandler(getFeed));
router.post('/', asyncHandler(createPost));
router.post('/:postId/like', asyncHandler(likePost));
router.delete('/:postId/like', asyncHandler(unlikePost));
router.post('/:postId/comments', asyncHandler(addComment));

module.exports = router;
