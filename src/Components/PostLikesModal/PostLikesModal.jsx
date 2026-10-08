import { X, Heart, UserRound, LoaderCircle, ChevronRight } from "lucide-react";
import { UserContext } from "../Context/use.context";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";

export default function PostLikesModal({ post, setIsLikeModalOpen }) {
  const { token, userInfo } = useContext(UserContext);
  const [postLikes, setPostLikes] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  async function getPostLikes() {
    try {
      const config = {
        url: `https://route-posts.routemisr.com/posts/${post._id}/likes?page=${currentPage}&limit=6`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      };
      const { data } = await axios.request(config);
      if (data.success) {
        if (currentPage === 1) {
          setPostLikes(data.data.likes);
        } else {
          setPostLikes((prev) => [...prev, ...data.data.likes]);
        }
      }
    } catch (error) {
      console.log({ error });
    }
  }
  useEffect(() => {
    getPostLikes();
  }, [post._id, currentPage]);

  function onClose(event) {
    if (event.target === event.currentTarget) {
      setIsLikeModalOpen(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#16161a]/40 px-3 py-4 sm:px-4 sm:py-6"
      onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-likes-title"
        className="flex max-h-[min(92dvh,720px)] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_8px_24px_rgba(22,22,26,0.06),0_24px_64px_-16px_rgba(22,22,26,0.18)]">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-[#eeeeec] bg-gradient-to-b from-white to-[#fcfcfb] px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f5f1f2] text-[#16161a]">
              <Heart size={18} />
            </span>

            <div className="min-w-0">
              <h2
                id="post-likes-title"
                className="text-base font-semibold tracking-tight text-[#16161a] sm:text-lg">
                Likes
              </h2>

              <p className="mt-0.5 text-xs text-[#707078] sm:text-[13px]">
                People who liked this post
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLikeModalOpen(false)}
            aria-label="Close likes"
            className="mr-0.5 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-[#929298] transition-colors duration-200 hover:bg-[#f2f2f1] hover:text-[#16161a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16161a]">
            <X className="size-[18px]" />
          </button>
        </header>

        {/* Users */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 sm:px-4 sm:py-3">
          {postLikes === null ? (
            <div
              className="flex min-h-44 flex-col items-center justify-center gap-4 px-4"
              role="status"
              aria-label="Loading likes">
              <LoaderCircle className="size-5 animate-spin text-[#707078]" />
              <div className="w-full max-w-sm space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex items-center gap-3 py-1">
                    <span className="size-11 shrink-0 animate-pulse rounded-full bg-[#f0f0ef]" />
                    <span className="flex-1 space-y-2">
                      <span className="block h-3 w-2/5 animate-pulse rounded-full bg-[#f0f0ef]" />
                      <span className="block h-2.5 w-1/4 animate-pulse rounded-full bg-[#f5f5f4]" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : postLikes.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center px-6 py-8 text-center">
              <span className="mb-3 grid size-12 place-items-center rounded-full bg-[#f5f1f2] text-[#707078]">
                <Heart className="size-5" />
              </span>
              <p className="text-sm font-semibold text-[#16161a]">
                No likes yet
              </p>
              <p className="mt-1 max-w-56 text-xs leading-5 text-[#929298]">
                When people like this post, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {postLikes.map((user) => (
                <Link
                  key={user._id}
                  to={
                    (user._id ?? user.id) === (userInfo?._id ?? userInfo?.id)
                      ? "/my-profile"
                      : `/profile/${user._id ?? user.id}`
                  }
                  className="group flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors duration-200 hover:bg-[#f8f8f7] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#16161a] sm:px-3">
                  {user.photo ? (
                    <img loading="lazy"
                      src={user.photo}
                      alt={user.name}
                      className="size-11 shrink-0 rounded-full border border-[#eeeeec] bg-[#f2f2f1] object-cover ring-2 ring-transparent transition group-hover:ring-[#eeeeec]"
                    />
                  ) : (
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#eeeeec] bg-[#f5f5f4] text-[#777780]">
                      <UserRound size={19} />
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#16161a] transition-colors group-hover:text-[#4d4d55]">
                      {user.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[#929298]">
                      @{user.username}
                    </span>
                  </span>

                  <ChevronRight className="size-4 shrink-0 text-[#c4c4c2] transition duration-200 group-hover:translate-x-0.5 group-hover:text-[#707078]" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {postLikes?.length > 6 && (
          <footer
            className="cursor-pointer border-t border-[#eeeeec] bg-[#fcfcfb] px-4 py-3 text-center text-[11px] text-[#929298] sm:px-6 sm:text-xs"
            onClick={() => {
              setCurrentPage((prev) => prev + 1);
            }}>
            Show more
          </footer>
        )}
      </div>
    </div>
  );
}
