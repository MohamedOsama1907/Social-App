import {
  Bookmark,
  Copy,
  Ellipsis,
  Globe2,
  Heart,
  Check,
  // LoaderCircle,
  MessageCircle,
  Pencil,
  Repeat2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { UserContext } from "../Context/use.context";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import SharePostModal from "../SharePostModal/SharePostModal";
import PostLikesModal from "../PostLikesModal/PostLikesModal";
import EditPostModal from "../EditPostModal/EditPostModal";
import { followUser, getUserProfile } from "../UserServices/UserServices";
import { Link } from "react-router";
// import { followUser } from "../UserServices/UserServices";

function formatPostDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
//* post card component
export default function PostCard({
  post,
  onPostUpdate,
  onPostDelete,
  showTopComment,
}) {
  const { token, userInfo } = useContext(UserContext);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);


  const isOwnPost = userInfo?._id === post.user._id;
  function notifyPostUpdate(changes) {
    onPostUpdate?.({ ...post, ...changes }, post.bookmarked);
  }
  function onClose(e) {
    if (e.target !== e.currentTarget) {
      setIsActionsMenuOpen(false);
    }
  }
  async function requestPostAction(action, changes) {
    try {
      const config = {
        url: `https://route-posts.routemisr.com/posts/${post._id}/${action}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
      };
      const { data } = await axios.request(config);
      if (data.success) {
        notifyPostUpdate(changes);
      }
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLike() {
    const userId = userInfo?._id;
    if (!userId) return;

    const likes = post.likes ?? [];
    const wasLiked = likes.includes(userId);
    await requestPostAction("like", {
      likes: wasLiked
        ? likes.filter((likedUserId) => likedUserId !== userId)
        : [...likes, userId],
      likesCount: Math.max(0, (post.likesCount ?? 0) + (wasLiked ? -1 : 1)),
    });
  }

  async function handleBookMark() {
    await requestPostAction("bookmark", {
      bookmarked: !post.bookmarked,
    });
  }
  async function handleDelete() {
    try {
      const config = {
        url: `https://route-posts.routemisr.com/posts/${post._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE",
      };
      const { data } = await axios.request(config);
      if (data.success) {
        toast.success(data.message);
        onPostDelete?.(post);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function handleFollowing() {
    const data = await followUser(token, post.user._id);
    if (data.success) {
      setIsFollowing(data.data.following);
    }
  }
  async function handleFollowingState() {
    const data = await getUserProfile(token, post.user._id);
    if (data.success) {
      setIsFollowing(data.data.isFollowing);
    }
  }
  useEffect(() => {
    handleFollowingState();
  }, [token, post.user._id]);
  return (
    <div className="w-full mx-auto" onClick={onClose}>
      <article
        id={`post-${post._id}`}
        className="mx-auto w-full  rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_8px_24px_rgba(22,22,26,0.06)]">
        <header className="flex items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={`/profile/${post.user._id}`} className="shrink-0">
              <img loading="lazy"
                src={post.user.photo}
                alt={`${post.user.name}'s profile`}
                className="size-10 rounded-full object-contain sm:size-11"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <Link to={`/profile/${post.user._id}`} className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-[#16161a] sm:text-base hover:underline">
                      {post.user.name}
                    </h2>
                    <p className="truncate text-sm text-[#707078]">
                      @{post.user.username}
                    </p>
                  </Link>
                </div>

                <div>
                  {!isOwnPost && (
                    <button
                      onClick={handleFollowing}
                      type="button"
                      aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${post.user.name}`}
                      aria-pressed={isFollowing}
                      className="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg  text-[#16161a] text-[10px] font-semibold transition-colors  sm:h-8 sm:px-2.5 sm:text-xs">
                      {isFollowing ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <UserPlus className="size-4" aria-hidden="true" />
                      )}
                      <span>{isFollowing ? "Following" : "Follow"}</span>
                    </button>
                  )}
                </div>
              </div>
              <div className=" flex items-center gap-1.5 text-xs text-[#929298] sm:text-sm">
                <span>{formatPostDate(post.createdAt)}</span>
                <span aria-hidden="true">·</span>
                <Globe2 className="size-3.5" aria-hidden="true" />
                <span>{post.privacy}</span>
              </div>
            </div>
          </div>
          {/* menu */}
          <div className="relative mt-1 shrink-0">
            <button
              type="button"
              aria-label="More post options"
              aria-haspopup="menu"
              aria-expanded={isActionsMenuOpen}
              // toggle function (if the menu has opened ..close it and the oposite)
              onClick={(e) => {
                setIsActionsMenuOpen(!isActionsMenuOpen);
                e.stopPropagation();
              }}
              className="cursor-pointer flex size-9 items-center justify-center rounded-full text-[#707078] transition-colors hover:bg-[#f2f2f1] hover:text-[#16161a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16161a]/20">
              <Ellipsis className="size-5" aria-hidden="true" />
            </button>

            {isActionsMenuOpen && (
              <div
                role="menu"
                aria-label="Post actions"
                className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-[#e8e8e6] bg-white p-1.5 shadow-[0_12px_32px_rgba(22,22,26,0.14)]">
                {/*only the post owner can edit or delete the post */}
                {userInfo._id === post.user._id && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      setIsEditModal(true);
                    }}
                    className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#29292d] transition-colors hover:bg-[#f7f7f6]">
                    <Pencil
                      className="size-4 text-[#707078]"
                      aria-hidden="true"
                    />
                    <span>Edit post</span>
                  </button>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    handleBookMark();
                  }}
                  className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#29292d] transition-colors hover:bg-[#f7f7f6]">
                  <Bookmark
                    className={`size-4 text-[#707078] ${post.bookmarked ? "fill-current" : ""}`}
                    aria-hidden="true"
                  />
                  <span>
                    {post.bookmarked ? "Remove from saved" : "Save post"}
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setIsActionsMenuOpen(false)}
                  className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#29292d] transition-colors hover:bg-[#f7f7f6]">
                  <Copy className="size-4 text-[#707078]" aria-hidden="true" />
                  <span>Copy link</span>
                </button>
                {/*only the post owner can edit or delete the post */}
                {userInfo._id === post.user._id && (
                  <>
                    <div className="mx-2 my-1 h-px bg-[#eeeeec]" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        handleDelete();
                      }}
                      className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#c0393f] transition-colors hover:bg-[#fbecec]">
                      <Trash2 className="size-4" aria-hidden="true" />
                      <span>Delete post</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <Link to={`/posts/${post._id}`}>
          {post.body && (
            <p className="px-4 pb-5 text-sm leading-6 text-[#16161a] sm:px-6 sm:text-base lg:px-7">
              {post.body}
            </p>
          )}
          {post.image && (
            <div className="relative w-full overflow-hidden">
              {!imageLoaded && (
                <div className="h-80 w-full animate-pulse bg-gray-100" />
              )}

              <img loading="lazy"
                src={post.image}
                alt={`Post shared by ${post.user.name}`}
                onLoad={() => setImageLoaded(true)}
                className={`block h-auto max-h-130 w-full object-contain ${
                  imageLoaded ? "opacity-100" : "absolute opacity-0"
                }`}
              />
            </div>
          )}
          {post.sharedPost && (
            <div className="mx-4 mb-5 overflow-hidden rounded-xl border border-[#e8e8e6] bg-[#fafaf9] sm:mx-6 lg:mx-7">
              <div className="flex items-center gap-2.5 px-3.5 py-3 sm:px-4">
                <img loading="lazy"
                  src={post.sharedPost.user.photo}
                  alt={`${post.sharedPost.user.name}'s profile`}
                  className="size-8 shrink-0 rounded-full object-cover bg-[#f2f2f1]"
                />
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                    <h3 className="truncate text-xs font-semibold text-[#16161a] sm:text-sm">
                      {post.sharedPost.user.name}
                    </h3>
                    <span className="truncate text-xs text-[#707078]">
                      @{post.sharedPost.user.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#929298] sm:text-xs">
                    <span>{formatPostDate(post.sharedPost.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <Globe2 className="size-3" aria-hidden="true" />
                    <span>{post.sharedPost.privacy}</span>
                  </div>
                </div>
              </div>

              {post.sharedPost.body && (
                <p className="px-3.5 pb-3 text-xs leading-5 text-[#16161a] sm:px-4 sm:text-sm">
                  {post.sharedPost.body.trim()}
                </p>
              )}

              {post.sharedPost.image && (
                <img loading="lazy"
                  src={post.sharedPost.image}
                  alt={`Shared post by ${post.sharedPost.user.name}`}
                  className="block max-h-105 w-full object-contain"
                />
              )}
            </div>
          )}
        </Link>
        <footer className="px-4 py-4 sm:px-6 lg:px-7">
          <div className="flex items-center justify-between border-b border-[#eeeeec] pb-3 text-xs text-[#707078] sm:text-sm">
            <span
              className="cursor-pointer"
              onClick={() => {
                setIsLikeModalOpen(true);
              }}>
              {post.likesCount} likes
            </span>
            <div className="flex items-center gap-3">
              <Link to={`/posts/${post._id}`}>
                {" "}
                <span>{post.commentsCount} comments</span>
              </Link>
              <span>{post.sharesCount} shares</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 pt-2 text-xs font-medium text-[#707078] sm:text-sm">
            <button
              onClick={() => {
                handleLike();
              }}
              type="button"
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 transition-colors duration-150 hover:text-[#F33E58] ${post.likes.includes(userInfo._id) ? "text-[#F33E58]" : ""}`}>
              <Heart
                className={`size-4 ${post.likes.includes(userInfo._id) ? "fill-current text-[#F33E58]" : ""}`}
                aria-hidden="true"
              />
              <span>Like</span>
            </button>
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 transition-colors duration-150 hover:text-[#16161a]">
              <MessageCircle className="size-4" aria-hidden="true" />
              <span>Comment</span>
            </button>
            <button
              onClick={() => {
                setIsShareModalOpen(true);
              }}
              type="button"
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 transition-colors duration-150 hover:text-[#16161a] ${post.isShare ? "text-[#16161a]" : ""}`}>
              <Repeat2 className={`size-4`} aria-hidden="true" />
              <span>{post.isShare ? "Shared" : "Share"}</span>
            </button>
            <button
              onClick={handleBookMark}
              type="button"
              aria-label={post.bookmarked ? "Remove saved post" : "Save post"}
              aria-pressed={Boolean(post.bookmarked)}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 transition-colors duration-150 hover:text-[#16161a] ${post.bookmarked ? "text-[#16161a]" : ""}`}>
              <Bookmark
                className={`size-4 ${post.bookmarked ? "fill-current text-[#16161a]" : ""}`}
                aria-hidden="true"
              />
              <span>{post.bookmarked ? "Saved" : "Save"}</span>
            </button>
          </div>

          {post.topComment && showTopComment && (
            <div className="mt-4 rounded-2xl border border-[#e9e9ed] bg-white p-3 transition-colors hover:border-[#d9d9df] sm:p-4">
              <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[#85858e]">
                <MessageCircle size={14} aria-hidden="true" />
                <span>Top comment</span>
              </div>

              <div className="flex items-start gap-3">
                <Link
                  to={`/profile/${post.topComment.commentCreator._id}`}
                  className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#16161a]/20"
                  aria-label={`View ${post.topComment.commentCreator.name}'s profile`}>
                  <img loading="lazy"
                    src={post.topComment.commentCreator.photo}
                    alt=""
                    className="size-9 rounded-full bg-[#f2f2f1] object-cover ring-2 ring-white"
                  />
                </Link>

                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-[#f7f7f8] px-3.5 py-2.5 sm:px-4">
                  <Link
                    to={`/profile/${post.topComment.commentCreator._id}`}
                    className="text-[13px] font-semibold text-[#202026] hover:underline">
                    {post.topComment.commentCreator.name}
                  </Link>

                  <Link
                    to={`/posts/${post._id}`}
                    className="mt-1 block text-[13px] leading-5 text-[#55555e] hover:text-[#16161a] sm:text-sm">
                    <p className="break-words whitespace-pre-wrap">
                      {post.topComment.content}
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </footer>
      </article>
      {isShareModalOpen && (
        <SharePostModal
          onPostShared={() =>
            notifyPostUpdate({
              isShare: true,
              sharesCount: (post.sharesCount ?? 0) + 1,
            })
          }
          post={post}
          setIsShareModalOpen={setIsShareModalOpen}
        />
      )}
      {isLikeModalOpen && (
        <PostLikesModal post={post} setIsLikeModalOpen={setIsLikeModalOpen} />
      )}
      {isEditModal && (
        <EditPostModal post={post} setIsEditModal={setIsEditModal} />
      )}
    </div>
  );
}
