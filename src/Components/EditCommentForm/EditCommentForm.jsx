import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, LoaderCircle, X } from "lucide-react";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { toast } from "sonner";
import { useContext } from "react";
import { UserContext } from "../Context/use.context";

export default function EditCommentForm({
  postId,
  comment,
  onCancel,
  onUpdated,
}) {
  const { token } = useContext(UserContext);
  const [imagePreview, setImagePreview] = useState(comment.image || null);
  const [imageRemoved, setImageRemoved] = useState(false);
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
    status,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setStatus,
    isSubmitting,
  } = useFormik({
    initialValues: { content: comment.content || "", image: null },
    validationSchema: schema,
    onSubmit: async (values, { setStatus }) => {
      setStatus(undefined);

      if (imageRemoved && !values.image) {
        setStatus(
          "The comment update API does not document image removal. Choose a replacement image or cancel to keep the current one.",
        );
        return;
      }

      const contentChanged = values.content !== (comment.content || "");
      const hasChanges = contentChanged || Boolean(values.image);
      if (!hasChanges) {
        onCancel();
        return;
      }

      try {
        const formData = new FormData();
        if (values.content) {
          formData.append("content", values.content);
        }
        if (values.image) formData.append("image", values.image);

        const { data } = await axios.request({
          url: `https://route-posts.routemisr.com/posts/${postId}/comments/${comment._id ?? comment.id}`,
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          data: formData,
        });

        if (!data?.success) {
          throw new Error(data?.message || "Could not update the comment.");
        }

        toast.success(data.message || "Comment updated successfully");
        onUpdated({
          content: values.content,
          imageFile: values.image,
          imageRemoved,
        });
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Could not update the comment. Please try again.";
        setStatus(message);
      }
    },
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 144 ? "auto" : "hidden";
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
    setFieldTouched("image", true, false);
    setImageRemoved(false);
    setImagePreview(URL.createObjectURL(image));
  }

  function removeImage() {
    setImagePreview(null);
    setFieldValue("image", null);
    setImageRemoved(Boolean(comment.image));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 min-w-0 rounded-xl border border-[#e8e8e6] bg-white p-3 shadow-[0_1px_2px_rgba(15,15,16,0.04)]">
      {imagePreview && (
        <div className="relative mb-3 w-fit max-w-full overflow-hidden rounded-xl border border-[#e8e8e6] bg-[#fafaf9]">
          <img
            src={imagePreview}
            alt="Comment image preview"
            className="block max-h-48 max-w-full object-contain"
          />
          <button
            type="button"
            onClick={removeImage}
            aria-label="Remove comment image"
            className="absolute right-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#16161a]/80 text-white hover:bg-[#16161a]">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        id={`edit-comment-image-${comment._id ?? comment.id}`}
        name="image"
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handleImageChange}
        onBlur={handleBlur}
      />

      <label
        htmlFor={`edit-comment-content-${comment._id ?? comment.id}`}
        className="sr-only">
        Edit comment
      </label>
      <div className="relative min-w-0">
        <textarea
          ref={textareaRef}
          id={`edit-comment-content-${comment._id ?? comment.id}`}
          name="content"
          rows={1}
          value={values.content}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(touched.content && errors.content)}
          className="min-h-11 w-full resize-none rounded-xl border border-[#e8e8e6] bg-white px-3.5 py-2.5 pr-12 text-sm leading-5 text-[#16161a] outline-none transition-colors placeholder:text-[#929298] hover:border-[#d8d8d5] focus:border-[#16161a]"
        />
        <label
          htmlFor={`edit-comment-image-${comment._id ?? comment.id}`}
          title="Replace comment image"
          className="absolute bottom-1 right-1 flex size-9 cursor-pointer items-center justify-center rounded-lg bg-white text-[#707078] hover:bg-[#f2f2f1] hover:text-[#16161a]">
          <ImageIcon className="size-4.5" aria-hidden="true" />
        </label>
      </div>

      {touched.image && errors.image && (
        <p className="mt-1 text-xs text-[#dc2626]" role="alert">
          *{errors.image}
        </p>
      )}
      {status && (
        <p className="mt-2 text-xs text-[#dc2626]" role="alert">
          {status}
        </p>
      )}

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-h-9 cursor-pointer rounded-lg border border-[#e8e8e6] px-3 text-xs font-semibold text-[#424249] transition-colors hover:bg-[#f7f7f6] disabled:cursor-not-allowed disabled:opacity-60">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#16161a] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#303036] disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
}
