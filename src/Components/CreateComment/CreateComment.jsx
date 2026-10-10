import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Image as ImageIcon, LoaderCircle, X } from "lucide-react";
import { useFormik } from "formik";
import * as yup from "yup";
import { UserContext } from "../Context/use.context";
import axios from "axios";
import { toast } from "sonner";

const DEFAULT_PROFILE_PHOTO =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

const MAX_TEXTAREA_HEIGHT = 144;

export default function CreateComment({ id, getPost, getAllComments }) {
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
    isSubmitting,
  } = useFormik({
    initialValues: {
      content: "",
      image: null,
    },
    validationSchema: schema,
    onSubmit: async function (values, { resetForm }) {
      try {
        const formData = new FormData();
        if (values.content) {
          formData.append("content", values.content);
        }
        if (values.image) {
          formData.append("image", values.image);
        }
        const config = {
          url: `https://route-posts.routemisr.com/posts/${id}/comments`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          data: formData,
        };
        const { data } = await axios.request(config);
        if (data.success) {
          toast.success(data.message);
          await getPost?.();
          await getAllComments?.(true);
          resetForm();
          setImagePreview(null);
          setFieldValue("image", null);
        }
      } catch (error) {
        console.error(
          "Create comment error:",
          error.response?.data || error.message,
        );

      }
    },
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [values.content]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="sticky bottom-0 z-20 -mx-4 bg-white px-4 pb-2 pt-3 sm:-mx-6 sm:px-6">
      <form onSubmit={handleSubmit}>
        {imagePreview && (
          <div className="relative mb-3 w-fit max-w-full overflow-hidden rounded-xl border border-[#e8e8e6] bg-[#fafaf9]">
            <img
              src={imagePreview}
              alt="Comment image preview"
              className="block max-h-40 max-w-full object-contain"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove attached image"
              className="absolute right-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#16161a]/80 text-white transition-colors hover:bg-[#16161a] focus:outline-none focus:ring-2 focus:ring-white">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          id="commentImage"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleImageChange}
          onBlur={handleBlur}
        />

        <div className="flex items-end gap-1.5 sm:gap-2">
          <Link to="/my-profile" title="My profile" className="mb-1 shrink-0">
            <img
              loading="lazy"
              src={userInfo?.photo || DEFAULT_PROFILE_PHOTO}
              alt={`${userInfo?.name || "User"}'s profile`}
              className="size-7 rounded-full bg-[#f2f2f1] object-cover sm:size-9"
            />
          </Link>

          <div className="relative min-h-11 min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              id="commentcontent"
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
              placeholder="Write a comment..."
              aria-label="Write a comment"
              aria-invalid={Boolean(touched.content && errors.content)}
              aria-describedby={
                touched.content && errors.content
                  ? "commentcontentError"
                  : undefined
              }
              className="absolute bottom-0 left-0 z-10 max-h-36 min-h-11 w-full resize-none overflow-y-hidden rounded-xl border border-[#e8e8e6] bg-white px-3.5 py-3 pr-11 text-sm leading-5 text-[#16161a] shadow-[0_4px_16px_rgba(22,22,26,0.06)] outline-none transition-colors duration-150 placeholder:text-[#929298] hover:border-[#d8d8d5] focus:border-[#16161a] focus:shadow-[0_0_0_3px_rgba(22,22,26,0.06)] sm:pr-12"
            />

            <label
              htmlFor="commentImage"
              title="Attach an image"
              className="absolute bottom-1 right-1 z-20 flex size-9 cursor-pointer items-center justify-center rounded-lg bg-white text-[#707078] transition-colors duration-150 hover:bg-[#f2f2f1] hover:text-[#16161a] focus-within:ring-2 focus-within:ring-[#16161a]/10">
              <ImageIcon className="size-4.5" aria-hidden="true" />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mb-0.5 inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#16161a] px-2.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(22,22,26,0.10)] transition-colors duration-150 hover:bg-[#2a2a2e] focus:outline-none focus:ring-2 focus:ring-[#16161a]/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:gap-1.5 sm:px-4 sm:text-sm disabled:cursor-not-allowed ">
            {isSubmitting ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              "Comment"
            )}
          </button>
        </div>

        {touched.content && errors.content && (
          <p
            id="commentcontentError"
            className="ml-10 mt-1.5 text-[12px] text-[#dc2626] sm:ml-12"
            role="alert">
            *{errors.content}
          </p>
        )}

        {touched.image && errors.image && (
          <p
            className="ml-10 mt-1.5 text-[12px] text-[#dc2626] sm:ml-12"
            role="alert">
            *{errors.image}
          </p>
        )}

        {status && (
          <p
            className="ml-10 mt-1.5 text-[12px] text-[#dc2626] sm:ml-12"
            role="alert">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
