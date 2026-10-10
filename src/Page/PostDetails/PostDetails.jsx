import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import axios from "axios";
import {
  ArrowLeft,
  Ellipsis,
  Heart,
  MessageCircle,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import PostCard from "../../Components/PostCard/PostCard";
import PostSkeleton from "../../Components/PostSkelleton/PostSkelleton";
import { UserContext } from "../../Components/Context/use.context";
import CreateComment from "../../Components/CreateComment/CreateComment";
import CreateReplyComment from "../../Components/CreateReplyComment/CreateReplyComment";
import EditCommentForm from "../../Components/EditCommentForm/EditCommentForm";
import { toast } from "sonner";

export default function PostDetails() {
  const { id } = useParams();

  const navigate = useNavigate();
  const { token, userInfo } = useContext(UserContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allComments, setAllComments] = useState([]);
  const [repliesByComment, setRepliesByComment] = useState({});
  const [replyPages, setReplyPages] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyFormCommentId, setReplyFormCommentId] = useState(null);
  const [loadingReplyPages, setLoadingReplyPages] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [pendingLikeCommentIds, setPendingLikeCommentIds] = useState(
    () => new Set(),
  );
  const pendingLikeCommentIdsRef = useRef(new Set());
  const localCommentImageUrls = useRef(new Map());
  const getCommentLikes = (comment) =>
    Array.isArray(comment.likes) ? comment.likes : [];
  const getLikeUserId = (like) =>
    typeof like === "string" || typeof like === "number"
      ? String(like)
      : String(
          like?._id ?? like?.id ?? like?.user?._id ?? like?.user?.id ?? "",
        );
  const isCommentLikedByCurrentUser = (comment) => {
    const currentUserId = userInfo?._id ?? userInfo?.id;
    return Boolean(
      currentUserId &&
      getCommentLikes(comment).some(
        (like) => getLikeUserId(like) === String(currentUserId),
      ),
    );
  };
  const profilePath = (person) => {
    const personId = person?._id ?? person?.id;
    const currentUserId = userInfo?._id ?? userInfo?.id;
    return personId === currentUserId ? "/my-profile" : `/profile/${personId}`;
  };
  useEffect(() => {
    return () => {
      localCommentImageUrls.current.forEach((url) => URL.revokeObjectURL(url));
      localCommentImageUrls.current.clear();
    };
  }, []);

  function handleCommentUpdated(commentId, changes) {
    let image;
    if (changes.imageFile) {
      const previousUrl = localCommentImageUrls.current.get(commentId);
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      image = URL.createObjectURL(changes.imageFile);
      localCommentImageUrls.current.set(commentId, image);
    }

    const updateComment = (comment) =>
      (comment._id ?? comment.id) === commentId
        ? {
            ...comment,
            content: changes.content,
            ...(changes.imageFile ? { image } : {}),
            isEdited: true,
          }
        : comment;

    setAllComments((previous) => previous.map(updateComment));
    setPost((previous) =>
      previous?.topComment
        ? { ...previous, topComment: updateComment(previous.topComment) }
        : previous,
    );
    setEditingCommentId(null);
    setOpenCommentMenuId(null);
  }

  async function handleCommentLike(comment) {
    const commentId = comment._id ?? comment.id;
    const currentUserId = userInfo?._id ?? userInfo?.id;
    if (
      !commentId ||
      !currentUserId ||
      pendingLikeCommentIdsRef.current.has(commentId)
    ) {
      return;
    }

    const wasLiked = isCommentLikedByCurrentUser(comment);
    pendingLikeCommentIdsRef.current.add(commentId);
    setPendingLikeCommentIds(new Set(pendingLikeCommentIdsRef.current));

    try {
      const { data } = await axios.request({
        method: "PUT",
        url: `https://route-posts.routemisr.com/posts/${id}/comments/${commentId}/like`,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data?.success) {
        throw new Error(data?.message || "Unable to update comment like.");
      }

      const updateComment = (item) => {
        if ((item._id ?? item.id) !== commentId) return item;
        const likes = getCommentLikes(item);
        const alreadyLiked = likes.some(
          (like) => getLikeUserId(like) === String(currentUserId),
        );
        if (alreadyLiked === !wasLiked) return item;

        const nextLikes = wasLiked
          ? likes.filter(
              (like) => getLikeUserId(like) !== String(currentUserId),
            )
          : [...likes, currentUserId];
        return {
          ...item,
          likes: nextLikes,
          likesCount: Math.max(
            0,
            (item.likesCount ?? likes.length) + (wasLiked ? -1 : 1),
          ),
        };
      };

      setAllComments((previous) => previous.map(updateComment));
      setPost((previous) =>
        previous?.topComment
          ? { ...previous, topComment: updateComment(previous.topComment) }
          : previous,
      );
    } catch (err) {
    } finally {
      pendingLikeCommentIdsRef.current.delete(commentId);
      setPendingLikeCommentIds(new Set(pendingLikeCommentIdsRef.current));
    }
  }

  async function handleDeleteComment(comment) {
    const commentId = comment._id ?? comment.id;
    if (!commentId || deletingCommentId === commentId) return;

    setDeletingCommentId(commentId);
    try {
      const { data } = await axios.request({
        method: "DELETE",
        url: `https://route-posts.routemisr.com/posts/${id}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data?.success) {
        throw new Error(data?.message || "Unable to delete comment.");
      }

      setAllComments((previous) =>
        previous.filter((item) => (item._id ?? item.id) !== commentId),
      );
      setPost((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          commentsCount: Math.max(0, (previous.commentsCount ?? 0) - 1),
          topComment:
            (previous.topComment?._id ?? previous.topComment?.id) === commentId
              ? null
              : previous.topComment,
        };
      });
      setRepliesByComment(
        ({ [commentId]: _removedReplies, ...remaining }) => remaining,
      );
      setReplyPages(({ [commentId]: _removedPage, ...remaining }) => remaining);
      setExpandedReplies(
        ({ [commentId]: _removedExpanded, ...remaining }) => remaining,
      );
      setLoadingReplyPages(
        ({ [commentId]: _removedLoading, ...remaining }) => remaining,
      );
      setReplyFormCommentId((current) =>
        current === commentId ? null : current,
      );
      setEditingCommentId((current) =>
        current === commentId ? null : current,
      );
      setOpenCommentMenuId(null);
      const localImageUrl = localCommentImageUrls.current.get(commentId);
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
        localCommentImageUrls.current.delete(commentId);
      }
      toast.success(data.message || "Comment deleted successfully.");
      if (
        allComments.length >= currentPage * 5 &&
        (post?.commentsCount ?? 0) > allComments.length
      ) {
        getAllComments(true);
      }
    } catch (err) {
    } finally {
      setDeletingCommentId(null);
    }
  }

  function handlePostUpdate(updatedPost) {
    setPost(updatedPost);
  }

  async function getPost() {
    setLoading(true);
    setError(false);
    try {
      const { data } = await axios.request({
        method: "GET",
        url: `https://route-posts.routemisr.com/posts/${id}`,
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(data?.data?.post ?? null);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }
  async function getAllReplieComments(
    commentId,
    page = 1,
    refreshTopPage = false,
  ) {
    setLoadingReplyPages((previous) => ({ ...previous, [commentId]: true }));
    try {
      const { data } = await axios.request({
        url: `https://route-posts.routemisr.com/posts/${id}/comments/${commentId}/replies?page=${page}&limit=5`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        const fetchedReplies = data.data.replies ?? [];
        setRepliesByComment((previous) => {
          const existingReplies = previous[commentId] ?? [];
          if (refreshTopPage) {
            const refreshedIds = new Set(
              fetchedReplies.map((reply) => reply._id ?? reply.id),
            );
            const olderReplies = existingReplies
              .slice(Math.max(0, fetchedReplies.length - 1))
              .filter((reply) => !refreshedIds.has(reply._id ?? reply.id));
            const seen = new Set();
            return {
              ...previous,
              [commentId]: [...fetchedReplies, ...olderReplies]
                .filter((reply) => {
                  const replyId = reply._id ?? reply.id;
                  if (seen.has(replyId)) return false;
                  seen.add(replyId);
                  return true;
                })
                .slice(
                  0,
                  Math.max(
                    existingReplies.length,
                    (replyPages[commentId] ?? 1) * 5,
                  ),
                ),
            };
          }

          const existingIds = new Set(
            existingReplies.map((reply) => reply._id ?? reply.id),
          );
          return {
            ...previous,
            [commentId]: [
              ...existingReplies,
              ...fetchedReplies.filter((reply) => {
                const replyId = reply._id ?? reply.id;
                if (existingIds.has(replyId)) return false;
                existingIds.add(replyId);
                return true;
              }),
            ],
          };
        });
        setReplyPages((previous) => ({
          ...previous,
          [commentId]: Math.max(previous[commentId] ?? 1, page),
        }));
      }
    } catch (err) {
      console.log({ err });
    } finally {
      setLoadingReplyPages((previous) => ({ ...previous, [commentId]: false }));
    }
  }

  async function handleReplyCreated(commentId) {
    setAllComments((previous) =>
      previous.map((comment) =>
        comment._id === commentId
          ? { ...comment, repliesCount: (comment.repliesCount ?? 0) + 1 }
          : comment,
      ),
    );
    setExpandedReplies((previous) => ({ ...previous, [commentId]: true }));
    setReplyFormCommentId(null);
    setLoadingReplyPages((previous) => ({ ...previous, [commentId]: true }));
    await getAllReplieComments(commentId, 1, true);
  }
  // getAllCommentsFunction
  async function getAllComments(refreshTopPage = false) {
    try {
      const { data } = await axios.request({
        url: `https://route-posts.routemisr.com/posts/${id}/comments?page=${refreshTopPage ? 1 : currentPage}&limit=5`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const fetchedComments = data.data.comments ?? [];
        if (refreshTopPage) {
          setAllComments((prev) => {
            const firstPageIds = new Set(
              fetchedComments.map((comment) => comment._id ?? comment.id),
            );
            const olderComments = prev
              .slice(Math.max(0, fetchedComments.length - 1))
              .filter(
                (comment) => !firstPageIds.has(comment._id ?? comment.id),
              );
            const seen = new Set();
            return [...fetchedComments, ...olderComments]
              .filter((comment) => {
                const commentId = comment._id ?? comment.id;
                if (seen.has(commentId)) return false;
                seen.add(commentId);
                return true;
              })
              .slice(0, Math.max(prev.length, currentPage * 5));
          });
        } else {
          setAllComments((prev) => {
            const existingIds = new Set(
              prev.map((comment) => comment._id ?? comment.id),
            );
            return [
              ...prev,
              ...fetchedComments.filter((comment) => {
                const commentId = comment._id ?? comment.id;
                if (existingIds.has(commentId)) return false;
                existingIds.add(commentId);
                return true;
              }),
            ];
          });
        }
      }
    } catch (err) {
      console.log({ err });
    }
  }
  useEffect(() => {
    getPost();
  }, [id]);
  useEffect(() => {
    getAllComments();
  }, [id, currentPage]);
  return (
    <div className=" w-full md:w-[calc(100%-0.3rem)] xl:w-[calc(100%-5rem)] mx-auto pt-0 mt-6 lg:mt-12 p-2 lg:p-6">
      {/* Back navigation */}
      <div className="mb-4 sm:px-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e8e8e6] bg-white py-2 pl-2 pr-3.5 text-sm font-semibold text-[#424249] shadow-[0_1px_2px_rgba(15,15,16,0.04)] transition-all duration-150 hover:border-[#d8d8d5] hover:bg-[#fafaf9] hover:text-[#16161a] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16161a]/20 focus-visible:ring-offset-2">
          <span className="grid size-7 place-items-center rounded-lg bg-[#f2f2f1] text-[#55555e] transition-colors duration-150 group-hover:bg-[#e8e8e6] group-hover:text-[#16161a]">
            <ArrowLeft
              className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </span>
          Back to previous page
        </button>
      </div>

      {/* Loading state — reuses the existing PostSkeleton */}
      {loading && (
        <div className=" px-4 sm:px-0">
          <PostSkeleton />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className=" px-4 sm:px-0">
          <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-[#e8e8e6] bg-white py-16 px-6">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#fafaf9] border border-[#e8e8e6]">
              <RefreshCw className="size-5 text-[#929298]" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-[#16161a]">
              This post couldn&apos;t be loaded
            </p>
            <p className="mt-1 text-xs text-[#707078] max-w-[260px]">
              It may have been removed, or something went wrong on our end.
            </p>
            <button
              type="button"
              onClick={getPost}
              className="mt-4 rounded-lg bg-[#16161a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2a2a2e] transition-colors duration-150">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loaded post */}
      {!loading && !error && post && (
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-5 gap-5 ">
          <div className="lg:gap-6 lg:col-span-3 items-start lg:sticky lg:top-30 lg:h-fit">
            <PostCard
              post={post}
              onPostUpdate={handlePostUpdate}
              showTopComment={false}
            />
          </div>

          {/* The post response provides the count and a top-comment preview. */}
          <div className="md:col-span-1 lg:col-span-2 min-w-0">
            <div className="rounded-2xl border border-[#e8e8e6] bg-white px-4 py-4 sm:px-6 sm:py-5">
              <h2 className=" text-sm font-semibold text-[#16161a] mb-3">
                Comments ({post.commentsCount ?? 0})
              </h2>

              {(post.commentsCount ?? 0) === 0 ? (
                <>
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-[#fafaf9] border border-[#e8e8e6]">
                      <MessageCircle
                        className="size-[18px] text-[#929298]"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-xs font-medium text-[#16161a] sm:text-sm">
                      No comments yet
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#929298] sm:text-xs">
                      Be the first to share what you think.
                    </p>
                  </div>
                  <CreateComment
                    id={id}
                    getPost={getPost}
                    getAllComments={getAllComments}
                  />
                </>
              ) : post.commentsCount > 0 ? (
                <>
                  <div className="mt-4 flex w-full min-w-0 flex-col divide-y divide-[#eeeeec] border-t border-[#eeeeec]">
                    {allComments.map((comment) => (
                      <div
                        key={comment._id}
                        className="flex w-full min-w-0 items-start gap-2.5 py-3">
                        <Link
                          to={profilePath(comment.commentCreator)}
                          className="shrink-0">
                          <img
                            loading="lazy"
                            src={comment.commentCreator.photo}
                            alt={`${comment.commentCreator.name}'s profile`}
                            className="size-7 shrink-0 rounded-full bg-[#f2f2f1] object-cover sm:size-8"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          {editingCommentId === comment._id ? (
                            <EditCommentForm
                              postId={id}
                              comment={comment}
                              onCancel={() => setEditingCommentId(null)}
                              onUpdated={(changes) =>
                                handleCommentUpdated(comment._id, changes)
                              }
                            />
                          ) : (
                            <div className="inline-block w-full min-w-0 max-w-full rounded-2xl bg-[#f2f2f1] px-3.5 py-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-x-2">
                                  <Link
                                    to={profilePath(comment.commentCreator)}
                                    className="text-xs font-semibold text-[#16161a] hover:underline sm:text-[13px]">
                                    {comment.commentCreator.name}
                                  </Link>
                                  {(comment.isEdited ||
                                    (comment.updatedAt &&
                                      comment.createdAt &&
                                      new Date(comment.updatedAt) >
                                        new Date(comment.createdAt))) && (
                                    <span className="text-[10px] text-[#929298]">
                                      Edited
                                    </span>
                                  )}
                                </div>
                                {Boolean(
                                  (userInfo?._id ?? userInfo?.id) &&
                                  (comment.commentCreator?._id ??
                                    comment.commentCreator?.id) ===
                                    (userInfo?._id ?? userInfo?.id),
                                ) && (
                                  <div className="relative -mr-1 -mt-1 shrink-0">
                                    <button
                                      type="button"
                                      aria-label="Comment actions"
                                      aria-haspopup="menu"
                                      aria-expanded={
                                        openCommentMenuId === comment._id
                                      }
                                      onClick={() =>
                                        setOpenCommentMenuId((current) =>
                                          current === comment._id
                                            ? null
                                            : comment._id,
                                        )
                                      }
                                      className="flex size-7 cursor-pointer items-center justify-center rounded-full text-[#707078] transition-colors hover:bg-black/5 hover:text-[#16161a]">
                                      <Ellipsis
                                        className="size-4"
                                        aria-hidden="true"
                                      />
                                    </button>
                                    {openCommentMenuId === comment._id && (
                                      <div
                                        role="menu"
                                        className="absolute right-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-xl border border-[#e8e8e6] bg-white p-1 shadow-[0_8px_24px_rgba(22,22,26,0.12)]">
                                        <button
                                          type="button"
                                          role="menuitem"
                                          onClick={() => {
                                            setOpenCommentMenuId(null);
                                            setEditingCommentId(comment._id);
                                          }}
                                          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[#29292d] hover:bg-[#f7f7f6]">
                                          <Pencil
                                            className="size-3.5"
                                            aria-hidden="true"
                                          />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          role="menuitem"
                                          disabled={
                                            deletingCommentId === comment._id
                                          }
                                          onClick={() =>
                                            handleDeleteComment(comment)
                                          }
                                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[#c0393f] disabled:cursor-wait disabled:opacity-60">
                                          <Trash2
                                            className="size-3.5"
                                            aria-hidden="true"
                                          />
                                          {deletingCommentId === comment._id
                                            ? "Deleting…"
                                            : "Delete"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {comment.content && (
                                <p className="mt-0.5 w-full min-w-0 whitespace-normal break-words text-xs leading-5 text-[#424249] sm:text-[13px]">
                                  {comment.content}
                                </p>
                              )}

                              {comment.image && (
                                <img
                                  loading="lazy"
                                  src={comment.image}
                                  alt="Comment attachment"
                                  className="mt-2 block max-h-[200px] w-full max-w-[240px] rounded-xl object-cover"
                                />
                              )}
                            </div>
                          )}
                          {/* Like / Reply */}
                          <div className="mt-1.5 flex items-center gap-3.5">
                            <button
                              type="button"
                              aria-pressed={isCommentLikedByCurrentUser(
                                comment,
                              )}
                              disabled={pendingLikeCommentIds.has(
                                comment._id ?? comment.id,
                              )}
                              onClick={() => handleCommentLike(comment)}
                              className={`flex items-center gap-1 text-[11px] font-medium transition-colors duration-150 disabled:cursor-wait disabled:opacity-60 sm:text-xs ${isCommentLikedByCurrentUser(comment) ? "text-[#F33E58]" : "text-[#929298] hover:text-[#16161a]"}`}>
                              <Heart
                                className={`size-3.5 ${isCommentLikedByCurrentUser(comment) ? "fill-current text-[#F33E58]" : ""}`}
                                aria-hidden="true"
                              />
                              {getCommentLikes(comment).length > 0
                                ? getCommentLikes(comment).length
                                : "Like"}
                            </button>
                            <button
                              type="button"
                              aria-expanded={replyFormCommentId === comment._id}
                              onClick={() =>
                                setReplyFormCommentId((current) =>
                                  current === comment._id ? null : comment._id,
                                )
                              }
                              className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[#929298] transition-colors duration-150 hover:text-[#16161a] sm:text-xs">
                              <MessageCircle
                                className="size-3.5 cursor-pointer"
                                aria-hidden="true"
                              />
                              Reply
                            </button>
                          </div>

                          {replyFormCommentId === comment._id && (
                            <CreateReplyComment
                              key={comment._id}
                              postId={id}
                              commentId={comment._id}
                              onReplyCreated={() =>
                                handleReplyCreated(comment._id)
                              }
                            />
                          )}

                          {comment.repliesCount > 0 && (
                            <>
                              {expandedReplies[comment._id] ? (
                                <button
                                  type="button"
                                  aria-expanded="true"
                                  onClick={() =>
                                    setExpandedReplies((previous) => ({
                                      ...previous,
                                      [comment._id]: false,
                                    }))
                                  }
                                  className="mt-2 inline-flex min-h-8 cursor-pointer items-center rounded-full border border-[#e8e8e6] hover:bg-[#eeeeec] px-3 py-1 text-[11px] font-semibold text-[#424249] transition-colors duration-150   sm:text-xs">
                                  Hide replies
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  aria-expanded="false"
                                  onClick={() => {
                                    setExpandedReplies((previous) => ({
                                      ...previous,
                                      [comment._id]: true,
                                    }));

                                    if (
                                      !repliesByComment[comment._id]?.length
                                    ) {
                                      getAllReplieComments(comment._id, 1);
                                    }
                                  }}
                                  className="mt-2 inline-flex min-h-8 cursor-pointer items-center rounded-full border border-transparent bg-transparent px-3 py-1 text-[11px] font-semibold text-[#707078] transition-colors duration-150 hover:border-[#eeeeec] hover:bg-[#fafaf9] hover:text-[#16161a]  sm:text-xs">
                                  View {comment.repliesCount}{" "}
                                  {comment.repliesCount === 1
                                    ? "reply"
                                    : "replies"}
                                </button>
                              )}

                              {expandedReplies[comment._id] && (
                                <div className="relative ml-2 mt-3 space-y-3 pl-3 sm:ml-3 sm:pl-4">
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-0 top-3 bottom-3 border-l border-[#e8e8e6]"
                                  />
                                  {(repliesByComment[comment._id] ?? []).map(
                                    (reply) => (
                                      <div
                                        key={reply._id ?? reply.id}
                                        className="relative">
                                        <span
                                          aria-hidden="true"
                                          className="absolute -left-3 top-0 h-3 w-3 rounded-bl-xl border-b border-l border-[#e8e8e6] sm:-left-4"
                                        />

                                        <div className="flex min-w-0 items-start gap-2">
                                          <Link
                                            to={profilePath(
                                              reply.commentCreator,
                                            )}
                                            className="shrink-0">
                                            <img
                                              loading="lazy"
                                              src={reply.commentCreator.photo}
                                              alt=""
                                              className="size-6 shrink-0 rounded-full bg-[#f2f2f1] object-cover sm:size-7"
                                            />
                                          </Link>

                                          <div className="min-w-0 flex-1">
                                            <div className="inline-block max-w-full rounded-2xl rounded-tl-md border border-[#eeeeec] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(15,15,16,0.03)]">
                                              <div className="flex flex-wrap items-baseline gap-x-1.5">
                                                <Link
                                                  to={profilePath(
                                                    reply.commentCreator,
                                                  )}
                                                  className="text-xs font-semibold text-[#16161a] hover:underline">
                                                  {reply.commentCreator.name}
                                                </Link>
                                                <Link
                                                  to={profilePath(
                                                    reply.commentCreator,
                                                  )}
                                                  className="text-[11px] text-[#929298] hover:underline">
                                                  @
                                                  {
                                                    reply.commentCreator
                                                      .username
                                                  }
                                                </Link>
                                              </div>

                                              {reply.content && (
                                                <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-5 text-[#424249] sm:text-[13px]">
                                                  {reply.content}
                                                </p>
                                              )}
                                            </div>

                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 pl-1">
                                              <button
                                                type="button"
                                                className="flex items-center gap-1 text-[11px] font-medium text-[#929298] transition-colors hover:text-[#16161a] sm:text-xs">
                                                <Heart
                                                  className="size-3.5"
                                                  aria-hidden="true"
                                                />
                                                {reply.likesCount ??
                                                  reply.likes?.length ??
                                                  "Like"}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                  {(repliesByComment[comment._id] ?? [])
                                    .length < comment.repliesCount && (
                                    <button
                                      type="button"
                                      disabled={loadingReplyPages[comment._id]}
                                      className="relative ml-3 rounded-xl px-3 py-2 text-sm text-[#707078] transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60 sm:ml-4"
                                      onClick={() =>
                                        getAllReplieComments(
                                          comment._id,
                                          (replyPages[comment._id] ?? 1) + 1,
                                        )
                                      }>
                                      Show more replies
                                    </button>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {post.commentsCount > 5 &&
                      allComments.length < post.commentsCount && (
                        <div className="mt-3 flex justify-center">
                          <button
                            onClick={() => {
                              setCurrentPage((page) => page + 1);
                            }}
                            className="cursor-pointer inline-flex min-h-9 items-center justify-center rounded-full px-4 text-xs font-semibold text-[#707078] transition-colors hover:bg-[#f5f5f4] hover:text-[#16161a] sm:text-sm"
                            aria-label={`Show all ${post.comments} comments`}>
                            Show more comments
                          </button>
                        </div>
                      )}
                  </div>
                  <CreateComment
                    id={id}
                    getAllComments={getAllComments}
                    getPost={getPost}
                  />
                </>
              ) : (
                <>
                  <p className="py-6 text-center text-xs text-[#707078]">
                    {post.commentsCount} comments on this post.
                  </p>
                  <CreateComment
                    id={id}
                    getAllComments={getAllComments}
                    getPost={getPost}
                  />
                </>
              )}

              {/* Static comment thread — UI demo only, not from the API */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
