import axios from "axios";
import { useFormik } from "formik";
import { Link } from "react-router";
import {
  Image as ImageIcon,
  Smile,
  MapPin,
  X,
  LoaderCircle,
  Globe2,
  ChevronDown,
} from "lucide-react";
import * as yup from "yup";
import { UserContext } from "../Context/use.context";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function CreatePostForm({ onPostCreated }) {
  const { token } = useContext(UserContext);
  const [imagePreview, setImagePreview] = useState(null);
  const { userInfo } = useContext(UserContext);
  const schema = yup.object({
    body: yup.string().min(20, "body must be at least 20 characters"),
    image: yup
      .mixed()
      .nullable()
      .test("fileSize", "Image size must be less than 5 MB", (file) => {
        if (!file || file.size < 5 * 1024 * 1024) {
          return true;
        } else {
          return false;
        }
      })
      .test("fileType", "Image type must be PNG or JPEG or JPG", (file) => {
        if (
          !file ||
          ["image/png", "image/jpeg", "image/jpg"].includes(file.type)
        ) {
          return true;
        } else {
          return false;
        }
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
      // location: null,
      // privacy: "Public"
    },
    validationSchema: schema,
    onSubmit: async function (values, { resetForm }) {
      try {
        const formData = new FormData();
        if (values.body) {
          formData.append("body", values.body);
        }
        if (values.image) {
          formData.append("image", values.image);
        }
        const config = {
          url: "https://route-posts.routemisr.com/posts",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          data: formData,
        };
        const { data } = await axios.request(config);
        if (data.success) {
          toast.success(data.message);
          // to appear the created post
          await onPostCreated?.();
          /* 
          if (onPostCreated) {
            await onPostCreated();
            }
          */
          resetForm();
          setImagePreview(null);
          setFieldValue("image", null);
          // window.location.reload();
        }
      } catch (error) {
        console.log({ error });
      }
    },
  });
  return (
    <div className="w-full mx-auto mt-4 px-0 py-2 sm:py-3">
      <article className="mx-auto  w-9/10  overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_8px_24px_rgba(22,22,26,0.06)]">
        <form onSubmit={handleSubmit} onReset={handleReset}>
          {/* Top: avatar + textarea */}
          <div className="flex items-start gap-3 px-4 py-4 sm:gap-3.5 sm:px-6 sm:py-5 lg:px-7">
            <Link to={"/my-profile"} title="my profile">
              <img loading="lazy"
                src={
                  userInfo?.photo
                    ? userInfo.photo
                    : "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                }
                alt={`${userInfo?.name || "User"}'s profile image`}
                className="size-10 shrink-0 rounded-full object-contain sm:size-11"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <textarea
                id="postBody"
                name="body"
                rows={3}
                value={values.body}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="What's on your mind?"
                className=" w-full resize-none rounded-xl border border-[#e8e8e6] bg-[#fafaf9] px-3.5 py-3 text-sm text-[#16161a] placeholder:text-[#929298] outline-none transition-colors duration-150 hover:border-[#d8d8d5] focus:border-[#16161a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(22,22,26,0.06)] sm:text-base"
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
          {imagePreview ? (
            <div className="relative mx-4 mb-5 overflow-hidden rounded-xl border border-[#e8e8e6] bg-[#fafaf9] sm:mx-6 lg:mx-7">
              <img loading="lazy"
                src={imagePreview}
                // alt={image.name}
                className="block max-h-105 w-full object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFieldValue("image", null);
                }}
                aria-label="Remove image"
                className="cursor-pointer absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-[#16161a]/80 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-[#16161a]">
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="postImage"
              className="mx-4 mb-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d8d8d5] bg-[#fafaf9] px-3 py-6 text-center cursor-pointer sm:mx-6 sm:py-10 lg:mx-7">
              <input
                id="postImage"
                name="image"
                type="file"
                className="hidden"
                onChange={(e) => {
                  setFieldValue("image", e.target.files[0]);
                  const image = e.target.files[0];
                  if (!image) return;
                  const imageURl = URL.createObjectURL(image);
                  setImagePreview(imageURl);
                  // console.log(image);
                }}
              />
              <div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-[#f2f2f1] sm:size-11">
                <ImageIcon
                  className="size-4.5 text-[#929298]"
                  aria-hidden="true"
                />
              </div>
              <p className="text-xs font-medium text-[#16161a] sm:text-sm">
                Add photos to your post
              </p>
              <p className="mt-0.5 text-[11px] text-[#929298] sm:text-xs">
                PNG , JPEG or JPG, up to 5 MB
              </p>
            </label>
          )}
          {errors.image && touched.image ? (
            <p className="mx-4 mb-3 text-[13px] text-[#dc2626] sm:mx-6 lg:mx-7">
              *{errors.image}
            </p>
          ) : (
            ""
          )}
          {/* Image attachment dropzone */}

          {/* Footer: attachment icons + submit */}
          <footer className="px-4 py-4 sm:px-6 lg:px-7">
            <div className="flex items-center justify-between gap-3 border-t border-[#eeeeec] pt-3">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <label
                  htmlFor="postImage"
                  aria-label="Add photo"
                  className="flex size-9 items-center justify-center rounded-lg text-[#707078] transition-colors duration-150 hover:text-[#16161a] cursor-pointer sm:size-10">
                  <ImageIcon className="size-4.5" aria-hidden="true" />
                </label>
                <button
                  type="button"
                  aria-label="Add emoji"
                  className="flex size-9 items-center justify-center rounded-lg text-[#707078] transition-colors duration-150 hover:text-[#16161a] cursor-pointer sm:size-10">
                  <Smile className="size-4.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Add location"
                  className="hidden size-9 items-center justify-center rounded-lg text-[#707078] transition-colors duration-150 hover:text-[#16161a] cursor-pointer sm:flex sm:size-10">
                  <MapPin className="size-4.5" aria-hidden="true" />
                </button>
              </div>

              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-[#16161a] px-5 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(22,22,26,0.10)] transition-colors duration-150 hover:bg-[#2a2a2e] sm:px-6 sm:py-2.5 sm:text-sm">
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin mx-auto block" />
                ) : (
                  `Post`
                )}
              </button>
            </div>
          </footer>
        </form>
      </article>
    </div>
  );
}
