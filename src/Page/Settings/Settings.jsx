import { useContext, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router";
import {
  Bell,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  ShieldCheck,
  UserCircle,
  UserRound,
} from "lucide-react";
import { UserContext } from "../../Components/Context/use.context";
import { toast } from "sonner";
import {
  changePassword,
  uploadProfilePhoto,
} from "../../Components/UserServices/UserServices";
import { Helmet } from "react-helmet-async";

export default function SettingsPage({}) {
  const { setToken, token, userInfo, setUserInfo } = useContext(UserContext);
  const fileInputRef = useRef(null);
  const [myImage, setMyImage] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [followerNotifications, setFollowerNotifications] = useState(false);
  const [isCurrentPassTrue, setIsCurrentPassTrue] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    return () => {
      if (myImage?.startsWith("blob:")) URL.revokeObjectURL(myImage);
    };
  }, [myImage]);

  const photoSchema = yup.object({
    body: yup.string(),
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

  const photoForm = useFormik({
    initialValues: { image: null },
    validationSchema: photoSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!values.image) {
        return;
      }

      try {
        const formData = new FormData();
        if (values.body) formData.append("body", values.body);
        formData.append("photo", values.image);

        const data = await uploadProfilePhoto(token, formData);
        if (data?.success) {
          toast?.success?.(data.message || "Profile photo updated.");
          const updatedUserInfo = { ...userInfo, photo: data.data.photo };
          setUserInfo(updatedUserInfo);
          sessionStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
          toast?.success?.(data.message || "Profile photo updated.");
          setMyImage(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          resetForm();
        }
      } catch (error) {
        console.error(error);
      }
    },
  });
  const passwordRegux =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  const schema = yup.object({
    currentPassword: yup
      .string()
      .required("Current password is required")
      .matches(passwordRegux, "Current password must be strong"),
    newPassword: yup
      .string()
      .matches(passwordRegux, "New password must be strong")
      .notOneOf(
        [yup.ref("currentPassword")],
        "New password must be different from current password",
      )
      .required("New password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const { errors, touched, handleBlur, handleChange, handleSubmit } = useFormik(
    {
      initialValues: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      validationSchema: schema,
      onSubmit: async (values, { resetForm }) => {
        try {
          const data = await changePassword(
            token,
            values.currentPassword,
            values.newPassword,
          );
          if (data.success) {
            toast.success(data.message);
            setToken(data.data.token);
            sessionStorage.setItem("token", data.data.token);
            resetForm();
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          }
        } catch (error) {
          if (
            error?.response?.data?.message === "incorrect email or password"
          ) {
            setIsCurrentPassTrue(true);
          }
          console.error({ error });
        }
      },
    },
  );

  const photoError = photoForm.touched.image && photoForm.errors.image;
  const displayPhoto = myImage || userInfo?.photo;

  // handle change password function
  return (
    <div className="min-h-screen bg-[#fbfbfc] text-[#16161a] antialiased">
      <Helmet>
        <title>Settings | Social App</title>
      </Helmet>
      <main className="w-[calc(100%-0.3rem)] lg:w-[calc(100%-2rem)] mx-auto pt-6 lg:pt-10 p-2 lg:p-5">
        <div className="mb-4 lg:mb-7 flex items-center gap-2 text-[12px] font-medium text-[#8a8a92]">
          <span>Account</span>
          <ChevronRight size={14} />
          <span className="text-[#424249]">Settings</span>
        </div>

        <header className="mb-4 lg:mb-8 flex flex-col justify-between gap-4 border-b border-[#e9e9ed] pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#85858e]">
              Your account
            </p>
            <h1 className="text-[30px] font-semibold tracking-[-0.045em] sm:text-[34px]">
              Settings
            </h1>
            <p className="mt-2 text-[14px] text-[#74747d]">
              Manage your account preferences and profile settings.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-[#e7e7eb] bg-white px-3 py-1.5 text-[11px] font-medium text-[#73737c] sm:self-auto">
            <ShieldCheck size={14} />
            Account protected
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#e8e8eb] bg-white p-5 shadow-[0_8px_28px_rgba(22,22,26,0.035)] sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4f4f5] text-[#29292f]">
                  <UserRound size={19} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                    Profile photo
                  </h2>
                  <p className="mt-1 text-[13px] leading-5 text-[#777780]">
                    Choose a clear photo so people can recognize you.
                  </p>
                </div>
              </div>

              <form
                onSubmit={photoForm.handleSubmit}
                className="rounded-xl bg-[#fafafb] p-4 sm:p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative size-[68px] shrink-0">
                      <div className="grid size-full place-items-center overflow-hidden rounded-full bg-[#e9eaec] text-xl font-semibold text-[#55555e] ring-4 ring-white">
                        {displayPhoto ? (
                          <img loading="lazy"
                            src={displayPhoto}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          userInfo?.name?.trim()?.[0] || "U"
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Choose a profile photo"
                        className="absolute -bottom-1 -right-1 z-10 grid size-7 cursor-pointer place-items-center rounded-full border-2 border-white bg-[#16161a] text-white shadow-sm transition hover:bg-[#303036]">
                        <Camera size={13} />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold">
                        {userInfo?.name || "Your name"}
                      </div>
                      <div className="mt-1 truncate text-[13px] text-[#85858e]">
                        {userInfo?.username ||
                          userInfo?.email ||
                          "Your account"}
                      </div>
                      <div className="mt-1 text-[11px] text-[#a0a0a7]">
                        PNG or JPEG or JPG · Max 5 MB
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    <input
                      id="imageField"
                      ref={fileInputRef}
                      type="file"
                      name="image"
                      accept="image/png,image/jpeg,image/jpg"
                      className="sr-only"
                      onBlur={photoForm.handleBlur}
                      onChange={(event) => {
                        const image = event.currentTarget.files?.[0];
                        if (!image) return;
                        photoForm.setFieldValue("image", image);
                        photoForm.setFieldTouched("image", true, false);
                        setMyImage(URL.createObjectURL(image));
                      }}
                      aria-label="Choose a profile photo"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#dedee3] bg-white px-3.5 text-[13px] font-medium text-[#38383f] transition hover:bg-[#f6f6f7] focus:outline-none focus:ring-4 focus:ring-black/5">
                      <ImagePlus size={16} />
                      {photoForm.values.image
                        ? "Choose another"
                        : "Change photo"}
                    </button>
                    {photoForm.values.image && (
                      <button
                        type="submit"
                        disabled={photoForm.isSubmitting || Boolean(photoError)}
                        className="h-10 cursor-pointer rounded-xl bg-[#16161a] px-4 text-[13px] font-semibold text-white transition hover:bg-[#303036] disabled:cursor-not-allowed disabled:opacity-45">
                        {photoForm.isSubmitting ? "Saving…" : "Save photo"}
                      </button>
                    )}
                  </div>
                </div>

                {photoError && (
                  <p className="mt-3 text-[12px] text-[#c13b43]">
                    {photoError}
                  </p>
                )}
              </form>
            </section>

            <section className="rounded-2xl border border-[#e8e8eb] bg-white p-5 shadow-[0_8px_28px_rgba(22,22,26,0.035)] sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4f4f5] text-[#29292f]">
                  <LockKeyhole size={19} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                    Change password
                  </h2>
                  <p className="mt-1 text-[13px] leading-5 text-[#777780]">
                    Use a unique password you don’t use elsewhere.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-[#393940]">
                      Current password
                    </span>
                    <span className="relative block">
                      <input
                        onChange={(e) => {
                          handleChange(e);
                          setIsCurrentPassTrue(false);
                        }}
                        name="currentPassword"
                        onBlur={handleBlur}
                        type={showCurrentPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        className="h-11 w-full rounded-xl border border-[#b8b8c0] bg-white px-3.5 pr-11 text-[14px] outline-none transition placeholder:text-[#a0a0a7] hover:border-[#92929a] focus:border-[#777780] focus:ring-4 focus:ring-black/[0.035]"
                      />
                      <button
                        type="button"
                        aria-label={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() =>
                          setShowCurrentPassword((visible) => !visible)
                        }
                        className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center text-[#85858e] hover:text-[#333339]">
                        {showCurrentPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </span>
                  </label>
                  {errors.currentPassword && touched.currentPassword ? (
                    <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                      *{errors.currentPassword}
                    </p>
                  ) : (
                    ""
                  )}
                  {isCurrentPassTrue && (
                    <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                      *incorrect password
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-0 md:mt-5 ">
                  <div>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-medium text-[#393940]">
                        New password
                      </span>
                      <span className="relative block">
                        <input
                          onChange={handleChange}
                          name="newPassword"
                          onBlur={handleBlur}
                          type={showNewPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          className="h-11 w-full rounded-xl border border-[#b8b8c0] bg-white px-3.5 pr-11 text-[14px] outline-none transition hover:border-[#92929a] focus:border-[#777780] focus:ring-4 focus:ring-black/[0.035]"
                        />
                        <button
                          type="button"
                          aria-label={
                            showNewPassword ? "Hide password" : "Show password"
                          }
                          onClick={() =>
                            setShowNewPassword((visible) => !visible)
                          }
                          className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center text-[#85858e] hover:text-[#333339]">
                          {showNewPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </span>
                    </label>
                    {errors.newPassword && touched.newPassword ? (
                      <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                        *{errors.newPassword}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                  <div>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-medium text-[#393940]">
                        Confirm new password
                      </span>

                      <span className="relative block">
                        <input
                          onChange={handleChange}
                          name="confirmPassword"
                          onBlur={handleBlur}
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          className="h-11 w-full rounded-xl border border-[#b8b8c0] bg-white px-3.5 pr-11 text-[14px] outline-none transition hover:border-[#92929a] focus:border-[#777780] focus:ring-4 focus:ring-black/[0.035]"
                        />
                        <button
                          type="button"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onClick={() =>
                            setShowConfirmPassword((visible) => !visible)
                          }
                          className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center text-[#85858e] hover:text-[#333339]">
                          {showConfirmPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </span>
                    </label>
                    {errors.confirmPassword && touched.confirmPassword ? (
                      <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                        *{errors.confirmPassword}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#f0f0f2] pt-4 sm:flex-row sm:items-center sm:justify-between mt-5">
                  <p className="text-[11px] leading-5 text-[#898991]">
                    At least 8 characters. A mix of letters, numbers, and
                    symbols is recommended.
                  </p>
                  <button
                    type="submit"
                    className="h-10 shrink-0 cursor-pointer rounded-xl bg-[#16161a] px-4 text-[13px] font-semibold text-white transition hover:bg-[#303036] focus:outline-none focus:ring-4 focus:ring-black/10">
                    Update password
                  </button>
                </div>
              </form>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-[#e8e8eb] bg-white p-5 shadow-[0_8px_28px_rgba(22,22,26,0.035)] sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4f4f5] text-[#29292f]">
                  <Bell size={19} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                    Notifications
                  </h2>
                  <p className="mt-1 text-[13px] leading-5 text-[#777780]">
                    Choose the updates you’d like to see.
                  </p>
                </div>
              </div>
              {[
                [
                  "Email notifications",
                  "Occasional account updates",
                  emailNotifications,
                  setEmailNotifications,
                ],
                [
                  "Push notifications",
                  "Alerts on this device",
                  pushNotifications,
                  setPushNotifications,
                ],
                [
                  "New followers",
                  "When someone follows you",
                  followerNotifications,
                  setFollowerNotifications,
                ],
              ].map(([label, description, checked, setChecked]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-t border-[#f0f0f2] py-3.5 first:border-t-0 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-[13px] font-medium text-[#29292f]">
                      {label}
                    </div>
                    <p className="mt-0.5 text-[12px] text-[#85858e]">
                      {description}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={label}
                    onClick={() => setChecked((value) => !value)}
                    className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10 ${checked ? "bg-[#16161a]" : "bg-[#d4d4d8]"}`}>
                    <span
                      className={`absolute left-1 top-1 size-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              ))}
              <p className="mt-4 border-t border-[#f0f0f2] pt-3 text-[11px] text-[#92929a]">
                Display preferences only
              </p>
            </section>

            <section className="rounded-2xl border border-[#e8e8eb] bg-white p-5 shadow-[0_8px_28px_rgba(22,22,26,0.035)] sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4f4f5] text-[#29292f]">
                  <UserCircle size={19} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                    Account information
                  </h2>
                  <p className="mt-1 text-[13px] leading-5 text-[#777780]">
                    Your basic account details. Read-only on this page.
                  </p>
                </div>
              </div>
              <div className="divide-y divide-[#f0f0f2]">
                <div className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                  <span className="text-[13px] text-[#777780]">Username</span>
                  <span className="text-[13px] font-medium text-[#33333a]">
                    {userInfo?.username || "—"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span className="text-[13px] text-[#777780]">
                    Email address
                  </span>
                  <span className="text-[13px] font-medium text-[#33333a]">
                    {userInfo?.email || "—"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 py-3 last:pb-0">
                  <span className="text-[13px] text-[#777780]">
                    Account status
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2f7f3] px-2.5 py-1 text-[11px] font-medium text-[#477855]">
                    <Check size={12} />
                    Active
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
        <footer className="mt-7 flex items-center justify-between border-t border-[#e9e9ed] pt-5 text-[11px] text-[#96969d]">
          <span>Social App · Account settings</span>
          <span>Privacy · Terms</span>
        </footer>
      </main>
    </div>
  );
}

/*            <section className="rounded-2xl border border-[#e8e8eb] bg-white p-5 shadow-[0_8px_28px_rgba(22,22,26,0.035)]">
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f4f4f5] text-[#55555e]">
                  <CircleHelp size={18} />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold">Need a hand?</h2>
                  <p className="mt-1 text-[12px] leading-5 text-[#81818a]">
                    Visit our Help Center for account and security tips.
                  </p>
                  <a
                    href="#help"
                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#28282e] hover:underline">
                    Visit Help Center
                    <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </section> */
