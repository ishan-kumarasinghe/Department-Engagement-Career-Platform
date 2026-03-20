import { create } from 'zustand';
import api from '../config/api';

const useFeedStore = create((set, get) => ({
  posts: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,

  fetchFeed: async (reset = false) => {
    const { page, isLoading, hasMore } = get();
    if (isLoading || (!reset && !hasMore)) return;

    const currentPage = reset ? 1 : page;
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.get(`/api/content/posts?page=${currentPage}&limit=10`);
      const newPosts = data.posts || data;
      set((state) => ({
        posts: reset ? newPosts : [...state.posts, ...newPosts],
        page: currentPage + 1,
        hasMore: newPosts.length === 10,
        isLoading: false,
      }));
    } catch (e) {
      set({ isLoading: false, error: e.message });
    }
  },

  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

  updatePost: (postId, changes) =>
    set((state) => ({
      posts: state.posts.map((p) => (p._id === postId ? { ...p, ...changes } : p)),
    })),

  removePost: (postId) =>
    set((state) => ({ posts: state.posts.filter((p) => p._id !== postId) })),

  reset: () => set({ posts: [], page: 1, hasMore: true, isLoading: false, error: null }),
}));

export default useFeedStore;
