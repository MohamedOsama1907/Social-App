import { X, Globe2, ChevronDown, Share2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useContext } from "react";
import { UserContext } from "../Context/use.context";
import { useFormik } from "formik";
import * as yup from "yup";
function formatPostDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SharePostModal({
  onPostShared,
  post,
  setIsShareModalOpen,
}) {
  const { token, userInfo } = useContext(UserContext);
  const schema = yup.object({
    body: yup.string().nullable(),
  });
  const { errors, handleSubmit, handleChange, values, handleBlur, touched } =
    useFormik({
      initialValues: {
        body: "",
      },
      validationSchema: schema,
      onSubmit: async function handleShare(values) {
        try {
          const config = {
            url: `https://route-posts.routemisr.com/posts/${post._id}/share`,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            method: "POST",
            data: values,
          };
          const { data } = await axios.request(config);
          if (data.success) {
            toast.success(data.message);
            setIsShareModalOpen(false);
            onPostShared?.();
          }
        } catch (error) {
          if (error.response.data.message === "Post already shared") {
            return;
          }
        }
      },
    });
  function onClose(e) {
    if (e.target === e.currentTarget) {
      setIsShareModalOpen(false);
    }
  }
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#16161a]/40 px-3 py-4 sm:px-4 sm:py-20"
      onClick={onClose}>
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-post-title"
        className="flex max-h-full w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_8px_24px_rgba(22,22,26,0.06),0_24px_64px_-16px_rgba(22,22,26,0.18)] md:max-w-[500px] lg:max-w-[700px]">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-[#eeeeec] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2
              id="share-post-title"
              className="text-base font-semibold text-[#16161a] sm:text-lg">
              Share Post
            </h2>
            <p className="mt-0.5 text-xs text-[#707078] sm:text-sm">
              Share this post with your followers
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(false)}
            aria-label="Close"
            className=" -mr-1.5  cursor-pointer shrink-0 rounded-full p-1.5 text-[#929298] transition-colors duration-150 hover:bg-[#f2f2f1] hover:text-[#16161a]">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {/* Form (scrolls if the viewport is short) */}
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {/* Current user + textarea */}
            <div className="flex items-start gap-3 sm:gap-3.5">
              <img loading="lazy"
                src={userInfo.photo}
                alt={`${userInfo.name}'s profile`}
                className="size-10 shrink-0 rounded-full object-contain sm:size-11"
              />
              <div className="min-w-0 flex-1">
                <label htmlFor="shareMessage" className="sr-only">
                  Your message
                </label>
                <textarea
                  id="shareMessage"
                  name="body"
                  value={values.body}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  placeholder="Say something about this post..."
                  className="w-full resize-none rounded-xl border border-[#e8e8e6] bg-[#fafaf9] px-3.5 py-3 text-sm leading-6 text-[#16161a] placeholder:text-[#929298] outline-none transition-colors duration-150 hover:border-[#d8d8d5] focus:border-[#16161a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(22,22,26,0.06)] sm:text-base"
                />
                {errors.body && touched.body ? (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *{errors.body}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>

            {/* Original post preview */}
            <div className="mt-4 overflow-hidden rounded-xl border border-[#e8e8e6] bg-[#fafaf9]">
              <div className="flex items-center gap-2.5 px-3.5 py-3 sm:px-4">
                <img loading="lazy"
                  src={post.user.photo}
                  alt={`${post.user.name}'s profile`}
                  className="size-8 shrink-0 rounded-full object-cover bg-[#f2f2f1]"
                />
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                    <h3 className="truncate text-xs font-semibold text-[#16161a] sm:text-sm">
                      {post.user.name}
                    </h3>
                    <span className="truncate text-xs text-[#707078]">
                      @{post.user.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#929298] sm:text-xs">
                    <span>{formatPostDate(post.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                  </div>
                </div>
              </div>

              {post.body && (
                <p className="px-4 pb-5 text-sm leading-6 text-[#16161a] sm:px-6 sm:text-base lg:px-7">
                  {post.body}
                </p>
              )}
              {post.image && (
                <img loading="lazy"
                  src={post.image}
                  alt={`Post shared by ${post.user.name}`}
                  className="block h-auto max-h-80 w-full object-contain"
                />
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
            </div>
          </div>

          {/* Actions */}
          <footer className="flex items-center justify-end gap-2.5 border-t border-[#eeeeec] px-4 py-3.5 sm:gap-3 sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="cursor-pointer rounded-lg border border-[#e8e8e6] bg-white px-4 py-2 text-xs font-medium text-[#16161a] transition-colors duration-150 hover:bg-[#fafaf9] sm:px-5 sm:py-2.5 sm:text-sm">
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#16161a] px-5 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(22,22,26,0.10)] transition-colors duration-150 hover:bg-[#2a2a2e] sm:px-6 sm:py-2.5 sm:text-sm">
              <Share2 className="size-4" aria-hidden="true" />
              Share
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
