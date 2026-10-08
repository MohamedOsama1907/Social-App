import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import axios from "axios";
import { ArrowLeft, MessageCircle, RefreshCw, Heart } from "lucide-react";
import PostCard from "../../Components/PostCard/PostCard";
import PostSkeleton from "../../Components/PostSkelleton/PostSkelleton";
import { UserContext } from "../../Components/Context/use.context";

export default function PostDetails() {
  const { id } = useParams();
  console.log(id);

  const navigate = useNavigate();
  const { token, userInfo } = useContext(UserContext);
  console.log(token);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [appeartReplies, setAppeartReplies] = useState(null);
  const [currentReplyPage, setCurrentReplyPage] = useState(1);
  const [allComments, setAllComments] = useState([]);
  const [allReplieComments, setAllReplieComments] = useState([]);
  const profilePath = (person) => {
    const personId = person?._id ?? person?.id;
    const currentUserId = userInfo?._id ?? userInfo?.id;
    return personId === currentUserId ? "/my-profile" : `/profile/${personId}`;
  };
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
  async function getAllReplieComments(commentId, page) {
    try {
      const { data } = await axios.request({
        url: `https://route-posts.routemisr.com/posts/${id}/comments/${commentId}/replies?page=${currentReplyPage}&limit=5`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setAllReplieComments((prev) => [...prev, ...data.data.replies]);
      }
    } catch (err) {
      console.log({ err });
    }
  }
  // getAllCommentsFunction
  async function getAllComments() {
    try {
      const { data } = await axios.request({
        url: `https://route-posts.routemisr.com/posts/${id}/comments?page=${currentPage}&limit=5`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setAllComments((prev) => [...prev, ...data.data.comments]);
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
    <div className=" w-full md:w-[calc(100%-0.3rem)] xl:w-[calc(100%-8rem)] mx-auto pt-0 mt-6 lg:mt-12 p-2 lg:p-6">
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
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 ">
          <div className="lg:gap-6 md:col-span-2 lg:col-span-3 items-start lg:sticky lg:top-30 lg:h-fit">
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
              ) : post.commentsCount > 0 ? (
                <div className="mt-4 flex w-full min-w-0 flex-col divide-y divide-[#eeeeec] border-t border-[#eeeeec]">
                  {allComments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex w-full min-w-0 items-start gap-2.5 py-3">
                      <Link to={profilePath(comment.commentCreator)} className="shrink-0">
                      <img
                        loading="lazy"
                        src={comment.commentCreator.photo}
                        alt={`${comment.commentCreator.name}'s profile`}
                        className="size-7 shrink-0 rounded-full bg-[#f2f2f1] object-cover sm:size-8"
                      />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="inline-block w-full min-w-0 max-w-full rounded-2xl bg-[#f2f2f1] px-3.5 py-2.5">
                          <Link to={profilePath(comment.commentCreator)} className="text-xs font-semibold text-[#16161a] hover:underline sm:text-[13px]">
                            {comment.commentCreator.name}
                          </Link>

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
                        {/* Like / Reply — counts from real data, actions visual-only */}
                        <div className="mt-1.5 flex items-center gap-3.5">
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[11px] font-medium text-[#929298] transition-colors duration-150 hover:text-[#16161a] sm:text-xs">
                            <Heart className="size-3.5" aria-hidden="true" />
                            {comment.likes.length > 0
                              ? comment.likes.length
                              : "Like"}
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[11px] font-medium text-[#929298] transition-colors duration-150 hover:text-[#16161a] sm:text-xs">
                            <MessageCircle
                              className="size-3.5"
                              aria-hidden="true"
                            />
                            Reply
                          </button>
                        </div>

                        {comment.repliesCount > 0 && (
                          <>
                            {appeartReplies ? (
                              <button
                                type="button"
                                aria-expanded="true"
                                onClick={() => setAppeartReplies(false)}
                                className="mt-2 inline-flex min-h-8 cursor-pointer items-center rounded-full border border-[#e8e8e6] hover:bg-[#eeeeec] px-3 py-1 text-[11px] font-semibold text-[#424249] transition-colors duration-150   sm:text-xs">
                                Hide replies
                              </button>
                            ) : (
                              <button
                                type="button"
                                aria-expanded="false"
                                onClick={() => {
                                  setAppeartReplies(true);

                                  if (allReplieComments.length === 0) {
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

                            {appeartReplies &&
                              allReplieComments?.map((reply) => (
                                <div className="relative ml-2 mt-3 pl-3 sm:ml-3 sm:pl-4">
                                  <span
                                    aria-hidden="true"
                                    className="absolute -left-0.5 -top-3 h-6 w-4 rounded-bl-[10px] border-b border-l border-[#e8e8e6] sm:w-5"
                                  />

                                  <div className="flex min-w-0 items-start gap-2">
                                    <Link to={profilePath(reply.commentCreator)} className="shrink-0">
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
                                          <Link to={profilePath(reply.commentCreator)} className="text-xs font-semibold text-[#16161a] hover:underline">
                                            {reply.commentCreator.name}
                                          </Link>
                                          <Link to={profilePath(reply.commentCreator)} className="text-[11px] text-[#929298] hover:underline">
                                            @{reply.commentCreator.username}
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
                                  {allReplieComments > 5 && (
                                    <button
                                      className="mx-auto block rounded-xl px-3 py-2 text-sm cursor-pointer bg-gray-200 text-[#16161a]"
                                      onClick={() => {
                                        setCurrentReplyPage((page) => page + 1);
                                      }}>
                                      Show more{" "}
                                    </button>
                                  )}
                                </div>
                              ))}
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
              ) : (
                <p className="py-6 text-center text-xs text-[#707078]">
                  {post.commentsCount} comments on this post.
                </p>
              )}

              {/* Static comment thread — UI demo only, not from the API */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
