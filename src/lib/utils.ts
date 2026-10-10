export { cn } from "cn";

export function formatRelativePostTime(
  value: string | number | Date | null | undefined,
): string {
  if (!value) return "";

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000),
  );
  if (elapsedSeconds < 1) return "now";
  if (elapsedSeconds < 60) return `${elapsedSeconds}s`;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}min`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} h`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"}`;
  }
  if (elapsedDays < 30) return `${Math.floor(elapsedDays / 7)}w`;
  if (elapsedDays < 365) return `${Math.floor(elapsedDays / 30)} m`;
  return `${Math.floor(elapsedDays / 365)}y`;
}

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
