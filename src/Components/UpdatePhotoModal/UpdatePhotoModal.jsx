import { useContext, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { X, Image as ImageIcon, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { createPost, uploadProfilePhoto } from "../UserServices/UserServices";
import { UserContext } from "../Context/use.context";
export default function UpdatePhotoModal({ setUploadModal, getMyPosts }) {
  const { token, userInfo, setUserInfo } = useContext(UserContext);

  const [myImage, setMyImage] = useState(null);

  const schema = yup.object({
    body: yup.string().nullable(),
    image: yup
      .mixed()
      .nullable()
      .test(
        "fileSize",
        "Image size must be less than 5 MB",
        (file) => !file || file.size < 5 * 1024 * 1024,
      )
      .test("fileType", "Image type must be PNG or JPEG or JPG", (file) => {
        if (!file) return true;
        return ["image/png", "image/jpeg", "image/jpg"].includes(file.type);
      }),
  });
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    setFieldValue,
    resetForm,
    isSubmitting,
  } = useFormik({
    initialValues: {
      body: "",
      image: null,
    },
    validationSchema: schema,
    onSubmit: async function (values, { resetForm }) {
      try {
        // 1. Update Profile Photo
        if (values.image) {
          const formData = new FormData();
          if (values.body) {
            formData.append("body", values.body);
          }
          formData.append("photo", values.image);
          const data = await uploadProfilePhoto(token, formData);
          if (data.success) {
            const updatedUserInfo = { ...userInfo, photo: data.data.photo };
            setUserInfo(updatedUserInfo);
            sessionStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
            toast.success(data.message);
            setUploadModal(false);
            resetForm();
            await getMyPosts?.();
          }
        }

        // 2. Create Post
        const postFormData = new FormData();

        if (values.body) {
          postFormData.append("body", values.body);
        }

        if (values.image) {
          postFormData.append("image", values.image);
        }

        const { data } = await createPost(token, postFormData);
        if (data.success) {
          toast.success("Post created successfully");
          setUploadModal(false);
          resetForm();
          await getMyPosts?.();
        }
      } catch (error) {
        console.log(error);
      }
    },
  });

  function handleClose() {
    resetForm();
    setFieldValue("image", null);
    setUploadModal(false);
  }

  function handleRemoveImage() {
    setMyImage(null);
    setFieldValue("image", null);
  }

  //   // Generate / revoke the local object URL for the image preview
  // useEffect(() => {
  //   if (!values.image) {
  //     setImagePreview(null);
  //     return;
  //   }
  //   const url = URL.createObjectURL(values.image);
  //   setImagePreview(url);
  //   return () => URL.revokeObjectURL(url);
  // }, [values.image]);

  // if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16161a]/40 px-3 py-4 sm:px-4 sm:py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="flex max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_8px_24px_rgba(22,22,26,0.06),0_24px_64px_-16px_rgba(22,22,26,0.18)] md:max-w-[560px]">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-[#eeeeec] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2
              id="create-post-title"
              className="text-base font-semibold text-[#16161a] sm:text-lg">
              Select a profile picture
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="-mr-1.5 shrink-0 rounded-full p-1.5 text-[#929298] transition-colors duration-150 hover:bg-[#f2f2f1] hover:text-[#16161a]">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {/* Post text */}
            <textarea
              id="body"
              name="body"
              rows={1}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="describtion..."
              className="w-full resize-none rounded-xl border border-[#e8e8e6] bg-[#fafaf9] px-3.5 py-3 text-sm leading-6 text-[#16161a] placeholder:text-[#929298] outline-none transition-colors duration-150 hover:border-[#d8d8d5] focus:border-[#16161a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(22,22,26,0.06)] sm:text-base"
            />
            {errors.body && touched.body && (
              <p className="mt-1.5 text-xs text-[#dc2626]">{errors.body}</p>
            )}
            {/* Image upload / preview */}
            {myImage ? (
              <div className="relative mt-3 overflow-hidden rounded-xl border border-[#e8e8e6] bg-[#fafaf9]">
                <img loading="lazy"
                  src={myImage}
                  alt="Selected preview"
                  className="block max-h-[320px] w-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                  className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-[#16161a]/80 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-[#16161a]">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="image"
                className="mt-3 flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d8d8d5] bg-[#fafaf9] px-4 py-8 text-center transition-colors duration-150 hover:bg-[#f2f2f1] sm:py-10">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(event) => {
                    const image = event.currentTarget.files?.[0];
                    if (!image) return;

                    setFieldValue("image", image);
                    setMyImage(URL.createObjectURL(image));
                  }}
                  className="sr-only"
                />
                <div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-[#eeeeec] sm:size-11">
                  <ImageIcon
                    className="size-[18px] text-[#929298]"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs font-medium text-[#16161a] sm:text-sm">
                  Add a photo
                </p>
                <p className="mt-0.5 text-[11px] text-[#929298] sm:text-xs">
                  PNG, JPG or JPEG
                </p>
              </label>
            )}
            {errors.image && touched.image && (
              <p className="mt-1.5 text-xs text-[#dc2626]">{errors.image}</p>
            )}
            {/* Combined body-or-image error from the schema-level test */}
            {errors[""] && (
              <p className="mt-1.5 text-xs text-[#dc2626]">{errors[""]}</p>
            )}
          </div>

          {/* Footer actions */}
          <footer className="flex items-center justify-end gap-2.5 border-t border-[#eeeeec] px-4 py-3.5 sm:gap-3 sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[#e8e8e6] bg-white px-4 py-2 text-xs font-medium text-[#16161a] transition-colors duration-150 hover:bg-[#fafaf9] disabled:opacity-50 sm:px-5 sm:py-2.5 sm:text-sm">
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer inline-flex min-w-[88px] items-center justify-center gap-1.5 rounded-lg bg-[#16161a] px-5 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(22,22,26,0.10)] transition-colors duration-150 hover:bg-[#2a2a2e] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-2.5 sm:text-sm">
              {isSubmitting ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                "Post"
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
