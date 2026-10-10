import { useContext, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, LoaderCircle, X } from "lucide-react";
import { Link } from "react-router";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { toast } from "sonner";
import { UserContext } from "../Context/use.context";

const DEFAULT_PROFILE_PHOTO =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";
const MAX_TEXTAREA_HEIGHT = 112;

export default function CreateReplyComment({
  postId,
  commentId,
  onReplyCreated,
}) {
  const { token, userInfo } = useContext(UserContext);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const schema = yup.object({
    content: yup.string(),
    image: yup
      .mixed()
      .nullable()
      .test(
        "fileSize",
        "Image size must be less than 5 MB",
        (file) => !file || file.size < 5 * 1024 * 1024,
      )
      .test(
        "fileType",
        "Image type must be PNG or JPEG or JPG",
        (file) =>
          !file || ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
      ),
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = useFormik({
    initialValues: { content: "", image: null },
    validationSchema: schema,
    onSubmit: async function (values, { resetForm }) {
      try {
        const formData = new FormData();
        if (values.content) formData.append("content", values.content);
        if (values.image) formData.append("image", values.image);

        const { data } = await axios.request({
          url: `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/replies`,
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          data: formData,
        });
        if (data.success) {
          toast.success(data.message || "Reply added successfully");
          await onReplyCreated?.();
          resetForm();
          setImagePreview(null);
          setFieldValue("image", null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error(
          "Create reply error:",
          error.response?.data || error.message,
        );
      }
    },
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [values.content]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleImageChange(event) {
    const image = event.currentTarget.files?.[0];
    if (!image) return;
    setFieldValue("image", image);
    setImagePreview(URL.createObjectURL(image));
  }

  function removeImage() {
    setImagePreview(null);
    setFieldValue("image", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="mt-2 min-w-0 rounded-xl  bg-white p-2 sm:p-2.5">
      <form onSubmit={handleSubmit}>
        {imagePreview && (
          <div className="relative mb-2 w-fit max-w-full overflow-hidden rounded-lg border border-[#e8e8e6] bg-[#fafaf9]">
            <img
              src={imagePreview}
              alt="Reply image preview"
            className="block max-h-28 max-w-full object-contain"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove attached image"
              className="absolute right-1.5 top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-[#16161a]/80 text-white hover:bg-[#16161a]">
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          id={`reply-image-${commentId}`}
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleImageChange}
          onBlur={handleBlur}
        />

        <div className="flex min-w-0 items-end gap-1.5">
          <Link to="/my-profile" title="My profile" className="mb-1 shrink-0">
            <img
              loading="lazy"
              src={userInfo?.photo || DEFAULT_PROFILE_PHOTO}
              alt={`${userInfo?.name || "User"}'s profile`}
              className="size-6 rounded-full bg-[#f2f2f1] object-cover sm:size-7"
            />
          </Link>
          <div className="relative min-h-9 min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              name="content"
              rows={1}
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  if (!isSubmitting) event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Write a reply..."
              aria-label="Write a reply"
              aria-invalid={Boolean(touched.content && errors.content)}
              className="absolute bottom-0 left-0 z-10 max-h-28 min-h-9 w-full resize-none overflow-y-hidden rounded-lg border border-[#e8e8e6] bg-white px-2.5 py-2 pr-9 text-xs leading-5 text-[#16161a] outline-none transition-colors placeholder:text-[#929298] hover:border-[#d8d8d5] focus:border-[#16161a] sm:pr-10 sm:text-sm"
            />
            <label
              htmlFor={`reply-image-${commentId}`}
              title="Attach an image"
              className="absolute bottom-0.5 right-0.5 z-20 flex size-7 cursor-pointer items-center justify-center rounded-lg bg-white text-[#707078] hover:bg-[#f2f2f1] hover:text-[#16161a]">
              <ImageIcon className="size-3.5" aria-hidden="true" />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mb-0.5 inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#16161a] px-2 text-[10px] font-semibold text-white transition-colors hover:bg-[#2a2a2e] disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:px-2.5 sm:text-xs">
            {isSubmitting ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              "Reply"
            )}
          </button>
        </div>

        {touched.image && errors.image && (
          <p
            className="ml-8 mt-1 text-[11px] text-[#dc2626] sm:ml-9"
            role="alert">
            *{errors.image}
          </p>
        )}
      </form>
    </div>
  );
}
