export { cn } from "cn";

type PostRecord = {
  _id?: string;
  id?: string;
  bookmarked?: boolean;
};

export function updatePostInList<T extends PostRecord>(
  posts: T[] | null,
  updatedPost: T,
  addIfMissing = false,
): T[] | null {
  if (!posts) return posts;

  const updatedPostId = updatedPost._id ?? updatedPost.id;
  const hasPost = posts.some((post) => (post._id ?? post.id) === updatedPostId);
  const updatedPosts = posts.map((post) =>
    (post._id ?? post.id) === updatedPostId ? updatedPost : post,
  );

  return !hasPost && addIfMissing ? [updatedPost, ...posts] : updatedPosts;
}

export function updateBookmarkList<T extends PostRecord>(
  bookmarks: T[] | null,
  updatedPost: T,
): T[] | null {
  if (!bookmarks) return bookmarks;

  if (updatedPost.bookmarked) {
    return updatePostInList(bookmarks, updatedPost, true);
  }

  const updatedPostId = updatedPost._id ?? updatedPost.id;
  return bookmarks.filter((post) => (post._id ?? post.id) !== updatedPostId);
}

export function removePostFromList<T extends PostRecord>(
  posts: T[] | null,
  deletedPost: T,
): T[] | null {
  if (!posts) return posts;

  const deletedPostId = deletedPost._id ?? deletedPost.id;
  return posts.filter((post) => (post._id ?? post.id) !== deletedPostId);
}
