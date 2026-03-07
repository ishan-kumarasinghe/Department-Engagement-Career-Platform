import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Share2, X, Image as ImageIcon, Smile } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});

  // Mock data for demonstration
  useEffect(() => {
    // In production, this will fetch from contentApi.get('/api/posts')
    const mockPosts = [
      {
        id: '1',
        author: { _id: 'user1', fullName: 'Alice Johnson', role: 'student' },
        content: 'Just finished my internship at Tech Corp! Learned so much about full-stack development. Happy to network with fellow alumni!',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 12,
        comments: [
          { _id: 'c1', author: { fullName: 'Bob Smith' }, content: 'Congratulations! 🎉' },
        ],
        images: [],
      },
      {
        id: '2',
        author: { _id: 'user2', fullName: 'Carol Davis', role: 'alumni' },
        content: 'Announcing an exciting new research project on AI in healthcare. Looking for student collaborators!',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes: 28,
        comments: [],
        images: [],
      },
    ];
    setPosts(mockPosts);
  }, []);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    
    setIsLoading(true);
    try {
      // In production, call contentApi.post('/api/posts', {...})
      const newPost = {
        id: Date.now().toString(),
        author: user,
        content: postContent,
        createdAt: new Date(),
        likes: 0,
        comments: [],
        images: postImages,
      };
      
      setPosts([newPost, ...posts]);
      setPostContent('');
      setPostImages([]);
      setShowCreatePost(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = (postId) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
    
    // In production, call contentApi.post(`/api/posts/${postId}/like`)
  };

  const handleAddComment = (postId, commentText) => {
    if (!commentText.trim()) return;
    
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), commentText],
    }));

    // In production, call contentApi.post(`/api/posts/${postId}/comment`, {...})
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Create Post Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>

          <div className="flex-1">
            {!showCreatePost ? (
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full py-3 px-4 text-left transition-all"
              >
                What's on your mind?
              </button>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows="4"
                />

                {postImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {postImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`upload-${idx}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          onClick={() =>
                            setPostImages(postImages.filter((_, i) => i !== idx))
                          }
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all">
                    <ImageIcon size={20} />
                    <span className="text-sm">Photo/Video</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all">
                    <Smile size={20} />
                    <span className="text-sm">Emoji</span>
                  </button>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      setPostContent('');
                      setPostImages([]);
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={isLoading || !postContent.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Post Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {post.author?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{post.author?.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {formatTime(new Date(post.createdAt))} • {post.author?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 sm:px-6 py-4">
              <p className="text-gray-900 break-words">{post.content}</p>
              
              {post.images && post.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {post.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`post-${idx}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Post Stats */}
            <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex justify-between text-sm text-gray-600">
              <span>{likedPosts.has(post.id) ? post.likes + 1 : post.likes} Likes</span>
              <span>{(comments[post.id]?.length || 0) + post.comments.length} Comments</span>
            </div>

            {/* Post Actions */}
            <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex gap-2 md:gap-0">
              <button
                onClick={() => handleLikePost(post.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                  likedPosts.has(post.id)
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart
                  size={20}
                  className={likedPosts.has(post.id) ? 'fill-current' : ''}
                />
                <span className="hidden sm:inline">Like</span>
              </button>

              <button
                onClick={() =>
                  setExpandedPost(expandedPost === post.id ? null : post.id)
                }
                className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 py-2 rounded-lg transition-all"
              >
                <MessageCircle size={20} />
                <span className="hidden sm:inline">Comment</span>
              </button>

              <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 py-2 rounded-lg transition-all">
                <Share2 size={20} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* Comments Section */}
            {expandedPost === post.id && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="space-y-3 mb-4">
                  {post.comments.map((comment, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {comment.author?.fullName}
                        </p>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments[post.id]?.map((comment, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.fullName}
                        </p>
                        <p className="text-sm text-gray-700">{comment}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-semibold text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          handleAddComment(post.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button className="text-blue-600 font-semibold px-4 py-2 hover:bg-gray-100 rounded-full transition-all">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
