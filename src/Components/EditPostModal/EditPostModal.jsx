import { useContext, useEffect, useRef, useState } from "react";
import {
  X,
  LoaderCircle,
  Image as ImageIcon,
  Globe2,
  Repeat2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as yup from "yup";
import { UserContext } from "../Context/use.context";

export default function EditPostModal({ post, setIsEditModal, onPostUpdated }) {
  const { token } = useContext(UserContext);
  const [imagePreview, setImagePreview] = useState(post?.image || null);
  const [imageRemoved, setImageRemoved] = useState(false);
  //   ====================================
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const fileInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  const schema = yup.object({
    body: yup.string().min(3, "body must be at least 3 characters"),
    image: yup
      .mixed()
      .nullable()
      .test("fileSize", "Image size must be less than 5 MB", (file) => {
        return !file || file.size < 5 * 1024 * 1024;
      })
      .test("fileType", "Image type must be PNG or JPEG or JPG", (file) => {
        return (
          !file || ["image/png", "image/jpeg", "image/jpg"].includes(file.type)
        );
      }),
  });

  const {
    values,
    errors,
    touched,
    status,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    isSubmitting,
  } = useFormik({
    initialValues: {
      body: post?.body || "",
      image: null,
    },
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: async (values, { setStatus }) => {
      setStatus(undefined);

      if (post.image && imageRemoved && !values.image) {
        setStatus(
          "Choose a replacement image before saving. Removing an image without replacing it isn’t supported here.",
        );
        return;
      }

      const bodyChanged = values.body.trim() !== (post.body || "").trim();
      const hasChanges = bodyChanged || Boolean(values.image);
      if (!hasChanges) return;

      try {
        const formData = new FormData();

        if (bodyChanged) {
          formData.append("body", values.body.trim());
        }

        if (values.image) {
          formData.append("image", values.image);
        }

        const config = {
          url: `https://route-posts.routemisr.com/posts/${post._id}`,
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: formData,
        };

        const { data } = await axios.request(config);

        if (data?.success === false) {
          throw new Error(data?.message || "We couldn’t save your changes.");
        }

        toast.success(data?.message || "Post updated successfully.");
        await onPostUpdated?.(data);
        setIsEditModal(false);
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "We couldn’t save your changes. Please try again.";

        setStatus(message);
      }
    },
  });

  //   ========================
  const isSubmittingRef = useRef(isSubmitting);
  isSubmittingRef.current = isSubmitting;

  useEffect(() => {
    if (!post) return undefined;

    const previousOverflow = document.body.style.overflow;

    if (!previousFocusRef.current) {
      previousFocusRef.current = document.activeElement;
    }

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSubmittingRef.current) {
        event.stopPropagation();
        setIsEditModal(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [post, setIsEditModal]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  //   close function
  function onClose(event) {
    if (event.target === event.currentTarget && !isSubmitting) {
      setIsEditModal(false);
    }
  }

  if (!post) return null;

  const userName = post.user?.name || "User";
  const bodyIsUnchanged = values.body.trim() === (post.body || "").trim();
  const imageNeedsReplacement = Boolean(
    post.image && imageRemoved && !values.image,
  );
  const noChanges = bodyIsUnchanged && !values.image;
  const cannotSaveEmptyPost =
    !values.body.trim() && !post.image && !post.sharedPost && !values.image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#16161a]/40 px-3 pt-20 pb-4 sm:px-4 sm:pt-24 sm:pb-6"
      onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-post-title"
        className="flex max-h-[83dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_8px_24px_rgba(22,22,26,0.06),0_24px_64px_-16px_rgba(22,22,26,0.18)]">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#eeeeec] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2
              id="edit-post-title"
              className="text-base font-semibold text-[#16161a] sm:text-lg">
              Edit Post
            </h2>
            <p className="mt-0.5 text-xs text-[#707078] sm:text-sm">
              Update your post text or replace its image.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => !isSubmitting && setIsEditModal(false)}
            aria-label="Close edit post"
            disabled={isSubmitting}
            className="-mr-1.5 shrink-0 cursor-pointer rounded-full p-1.5 text-[#929298] transition-colors duration-150 hover:bg-[#f2f2f1] hover:text-[#16161a] focus:outline-none focus:ring-4 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-50">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              {post.user?.photo ? (
                <img
                  loading="lazy"
                  src={post.user.photo}
                  alt=""
                  className="size-10 shrink-0 rounded-full bg-[#f2f2f1] object-cover sm:size-11"
                />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f2f2f1] text-sm font-semibold text-[#707078] sm:size-11">
                  {userName.trim().slice(0, 1) || "U"}
                </span>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#16161a]">
                  {userName}
                </p>

                {post.user?.username && (
                  <p className="truncate text-xs text-[#707078]">
                    @{String(post.user.username).replace(/^@/, "")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="edit-post-body" className="sr-only">
                Your post text
              </label>

              <textarea
                id="edit-post-body"
                name="body"
                value={values.body}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={2}
                placeholder={
                  post.sharedPost
                    ? "Add a caption to your shared post…"
                    : "What would you like to say?"
                }
                aria-invalid={Boolean(touched.body && errors.body)}
                aria-describedby={
                  touched.body && errors.body
                    ? "edit-post-body-error"
                    : undefined
                }
                className="resize-none w-full  rounded-xl border border-[#e8e8e6] bg-[#fafaf9] px-3.5 py-3 text-sm leading-6 text-[#16161a] outline-none transition-colors duration-150 placeholder:text-[#929298] hover:border-[#d8d8d5] focus:border-[#16161a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(22,22,26,0.06)] sm:px-4 sm:py-3.5 sm:text-base"
              />

              {touched.body && errors.body && (
                <p
                  id="edit-post-body-error"
                  className="mt-1.5 text-xs text-[#c43f46]"
                  role="alert">
                  {errors.body}
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              id="editPostImage"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onBlur={handleBlur}
              onChange={(event) => {
                const image = event.currentTarget.files?.[0];
                if (!image) return;

                setFieldValue("image", image);
                setFieldTouched("image", true, false);
                setImagePreview(URL.createObjectURL(image));
              }}
            />

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border border-[#e8e8e6] bg-[#fafaf9]">
                <div className="flex items-center gap-2 border-b border-[#eeeeec] px-3.5 py-2.5 text-xs font-medium text-[#707078]">
                  <ImageIcon size={15} aria-hidden="true" />
                  {values.image ? "New image preview" : "Current post image"}
                </div>

                <img
                  loading="lazy"
                  src={imagePreview}
                  alt={
                    values.image
                      ? "Selected replacement image preview"
                      : `Image in ${userName}'s post`
                  }
                  className="block max-h-[min(320px,42dvh)] w-full object-contain"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFieldValue("image", null);
                    setImageRemoved(true);

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  aria-label="Remove selected image"
                  disabled={isSubmitting}
                  className="absolute right-2.5 top-12 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#16161a]/80 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-[#16161a] focus:outline-none focus:ring-2 focus:ring-white disabled:cursor-not-allowed disabled:opacity-50">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="editPostImage"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d8d8d5] bg-[#fafaf9] px-3 py-6 text-center transition-colors hover:border-[#aaaab1] hover:bg-[#f7f7f7] sm:py-8">
                <span className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-[#f2f2f1] sm:size-11">
                  <ImageIcon
                    className="size-4.5 text-[#929298]"
                    aria-hidden="true"
                  />
                </span>

                <span className="text-xs font-medium text-[#16161a] sm:text-sm">
                  {post.image
                    ? "Choose a replacement image"
                    : "Add a photo to your post"}
                </span>

                <span className="mt-0.5 text-[11px] text-[#929298] sm:text-xs">
                  PNG, JPEG or JPG, up to 5 MB
                </span>
              </label>
            )}

            {touched.image && errors.image && (
              <p className="text-[13px] text-[#dc2626]" role="alert">
                *{errors.image}
              </p>
            )}

            {imageNeedsReplacement && (
              <p
                className="rounded-lg border border-[#f1dfc8] bg-[#fffaf2] px-3 py-2 text-xs text-[#805b26]"
                role="status">
                Select a replacement image before saving. The current update
                flow does not specify image-only removal.
              </p>
            )}

            {post.sharedPost && (
              <div className="overflow-hidden rounded-xl border border-[#e8e8e6] bg-[#fafaf9]">
                <div className="flex items-center gap-2 border-b border-[#eeeeec] px-3.5 py-2.5 text-xs font-medium text-[#707078]">
                  <Repeat2 size={15} aria-hidden="true" />
                  Original shared post · not edited here
                </div>

                <div className="flex items-center gap-2.5 px-3.5 py-3 sm:px-4">
                  {post.sharedPost.user?.photo ? (
                    <img
                      loading="lazy"
                      src={post.sharedPost.user.photo}
                      alt=""
                      className="size-8 shrink-0 rounded-full bg-[#f2f2f1] object-cover"
                    />
                  ) : (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f2f2f1] text-xs font-semibold text-[#707078]">
                      {post.sharedPost.user?.name?.trim()?.slice(0, 1) || "U"}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#16161a] sm:text-sm">
                      {post.sharedPost.user?.name || "User"}
                    </p>

                    {post.sharedPost.user?.username && (
                      <p className="truncate text-xs text-[#707078]">
                        @
                        {String(post.sharedPost.user.username).replace(
                          /^@/,
                          "",
                        )}
                      </p>
                    )}
                  </div>

                  {post.sharedPost.privacy && (
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] text-[#929298]">
                      <Globe2 size={12} aria-hidden="true" />
                      {post.sharedPost.privacy}
                    </span>
                  )}
                </div>

                {post.sharedPost.body && (
                  <p className="whitespace-pre-wrap break-words px-3.5 pb-3 text-xs leading-5 text-[#16161a] sm:px-4 sm:text-sm">
                    {post.sharedPost.body.trim()}
                  </p>
                )}

                {post.sharedPost.image && (
                  <img
                    loading="lazy"
                    src={post.sharedPost.image}
                    alt={`Original post by ${
                      post.sharedPost.user?.name || "user"
                    }`}
                    className="block max-h-[min(320px,42dvh)] w-full object-contain"
                  />
                )}
              </div>
            )}

            {status && (
              <p
                className="rounded-lg border border-[#f2d6d6] bg-[#fff8f8] px-3 py-2 text-xs text-[#b5353c]"
                role="alert">
                {status}
              </p>
            )}
          </div>

          <footer className="flex shrink-0 flex-col-reverse gap-2.5 border-t border-[#eeeeec] px-4 py-3.5 sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={() => setIsEditModal(false)}
              disabled={isSubmitting}
              className="h-10 cursor-pointer rounded-lg border border-[#e8e8e6] bg-white px-4 text-sm font-medium text-[#16161a] transition-colors duration-150 hover:bg-[#fafaf9] focus:outline-none focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5">
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                noChanges ||
                cannotSaveEmptyPost ||
                imageNeedsReplacement
              }
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#16161a] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(22,22,26,0.10)] transition-colors duration-150 hover:bg-[#2a2a2e] focus:outline-none focus:ring-4 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-45 sm:px-6">
              {isSubmitting && (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
