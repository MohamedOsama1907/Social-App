import { Link, useNavigate } from "react-router";
import heroImage from "../../assets/hero.svg";
import logo from "../../assets/looogo.png";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import * as yup from "yup";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
export default function Signup() {
  const navigate = useNavigate();
  const [isUserNameExist, setIsUserNameExist] = useState(false);
  const [isEmailExist, setIsEmailExist] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const passwordRegux =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  const tenYearsAgo = new Date();
  tenYearsAgo.setUTCFullYear(tenYearsAgo.getUTCFullYear() - 10);
  const ageCutoff = Date.UTC(
    tenYearsAgo.getUTCFullYear(),
    tenYearsAgo.getUTCMonth(),
    tenYearsAgo.getUTCDate(),
  );
  // work with formik library
  // formik oject has many information about the form
  function handleEmail(e) {
    setFieldValue("email", e.target.value);
    setIsEmailExist(false);
  }
  function handleUserName(e) {
    setFieldValue("username", e.target.value);
    setIsUserNameExist(false);
  }
  const schema = yup.object({
    name: yup
      .string()
      .required("name is required")
      .min(3, "name must be at least 3 characters")
      .max(25, "name must be less than 25 characters"),
    username: yup
      .string()
      .required("user name is required")
      .min(3, "user name must be at least 3 characters")
      .max(25, "user name must be less than 25 characters"),
    email: yup
      .string()
      .required("email is required")
      .email("email is not valid"),
    password: yup
      .string()
      .required("password is required")
      .matches(passwordRegux, "password is not valid"),
    rePassword: yup
      .string()
      .required("repassword is required")
      .oneOf(
        [yup.ref("password")],
        "password and repassword should be the same",
      ),

    dateOfBirth: yup
      .date()
      .max(new Date(), "Date of birth cannot be in the future")
      .test(
        "minimum-age",
        "You must be older than 10 years to sign up",
        (value) => !value || value.getTime() < ageCutoff,
      )
      .required("Date Of Birth is required"),
    gender: yup
      .string()
      .required("Please select your gender")
      .oneOf(["male", "female"], "Please select a valid gender"),
  });

  //*  const {values, handleChange, handleSubmit} = useFormik
  // touched is an object that contains all the fields that the user has touched ===> but it wants handleBlur function in onBlur={handleBlur}
  const {
    values,
    handleChange,
    handleSubmit,
    handleBlur,
    errors,
    touched,
    setFieldValue,
    isSubmitting,
  } = useFormik({
    initialValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      rePassword: "",
      dateOfBirth: "",
      gender: "",
    },

    validationSchema: schema,
    // onsubmit function ==> values that the user enters
    onSubmit: async function (values) {
      try {
        // using (axios) inseted of fetch
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          url: "https://route-posts.routemisr.com/users/signup",
          data: values,
        };
        // we use await becuase it take time
        const { data } = await axios.request(options);
        if (data.success) {
          toast.success(data.message);
          navigate("/login");
        }
      } catch (error) {
        // if (error.response.data.message) {
        // }
        if (error.response.data.message === "user already exists.") {
          setIsEmailExist(true);
        }
        if (error.response.data.message === "username already exists.") {
          setIsUserNameExist(true);
        }
      }
    },
  });
  return (
    <>
      <Helmet>
        <title>Sign Up | Social App</title>
      </Helmet>
      <main className="mainSignup min-h-screen grid-rows-[minmax(220px,0.7fr)_auto] md:grid-rows-1">
        <section className="art-panel relative">
          <div className="relative z-10 flex space-x-2">
            <Link to={"/"} className="logo flex items-center space-x-3 ">
              <img loading="lazy"
                src={logo}
                alt="logo image"
                className="object-contain w-8 md:w-10 lg:w-14"
              />
              <h1 className="text-[20px] md:text-2xl lg:text-3xl font-bold text-[#16161a]">
                Social App
              </h1>
            </Link>
          </div>
          <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
            <img loading="lazy" src={heroImage} alt="" className=" w-1/2 md:w-3/4" />
          </div>
          <div className="relative z-10 mt-auto hidden max-w-[83.333%] lg:block md:max-w-3/4">
            <h2 className="text-[#16161a] text-xl md:text-2xl font-bold py-2 md:py-4">
              Where your circles come together
            </h2>
            <p className="text-gray-500 text-[12px] md:text-sm">
              Join a space built for real convesations, shares moments, and the
              people who matter to you without the noise.
            </p>
          </div>
          <div className="lg:hidden absolute left-0 right-0 bottom-0 h-px bg-linear-to-r from-[#16161a]/8 from-70% to-transparent to-100% pointer-events-none" />
          <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-px bg-linear-to-b from-[#16161a]/8 from-70% to-transparent to-100% pointer-events-none" />
        </section>
        <section className="form-panel flex min-w-0 items-start justify-center bg-[#f7f7f6] px-5 py-8 sm:px-8 sm:py-10 md:items-center md:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-[560px]">
            {" "}
            <h2 className="pb-2 text-2xl font-bold tracking-tight text-[#16161a] sm:pb-3 sm:text-[28px]">
              Create your account
            </h2>
            <p className="pb-5 text-[13px] leading-5 text-gray-500 sm:pb-6 sm:text-sm">
              It takes less than a minute to strated. Fill in your details
              bellow.
            </p>
            {/*             <SignupForm /> */}
            <form
              className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2"
              onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="label">
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jordan Cole"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  className="inputField"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {(errors.name && touched.name) ? (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *{errors.name}
                  </p>
                ) : (
                  ""
                )}
              </div>

              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="jordancole"
                  autoComplete="username"
                  minLength={3}
                  maxLength={30}
                  className="inputField"
                  value={values.username}
                  onChange={handleUserName}
                  onBlur={handleBlur}
                />
                {errors.username && touched.username ? (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *{errors.username}
                  </p>
                ) : (
                  ""
                )}
                {isUserNameExist && (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *user name already exists.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="label">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jordan@example.com"
                  autoComplete="email"
                  className="inputField"
                  value={values.email}
                  onChange={handleEmail}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email ? (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *{errors.email}
                  </p>
                ) : (
                  ""
                )}
                {isEmailExist && (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *user already exists.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    aria-describedby="password-help"
                    className="inputField pr-11"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center text-gray-500 hover:text-[#16161a]">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && touched.password ? (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *{errors.password}
                  </p>
                ) : (
                  <p
                    id="password-help"
                    className="mt-0.5 text-[13px] leading-5 text-gray-400">
                    Use at least 8 characters.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="rePassword" className="label">
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="rePassword"
                    name="rePassword"
                    type={showRePassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="inputField pr-11"
                    value={values.rePassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    aria-label={showRePassword ? "Hide password" : "Show password"}
                    onClick={() => setShowRePassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center text-gray-500 hover:text-[#16161a]">
                    {showRePassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.rePassword && touched.rePassword ? (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *{errors.rePassword}
                  </p>
                ) : (
                  ""
                )}
              </div>

              <div>
                <label htmlFor="gender" className="label">
                  Gender
                </label>

                <select
                  id="gender"
                  name="gender"
                  autoComplete="sex"
                  className="inputField"
                  value={values.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}>
                  <option className="text-sm" value="" disabled>
                    Select your gender
                  </option>
                  <option className="text-sm" value="female">
                    Female
                  </option>
                  <option className="text-sm" value="male">
                    Male
                  </option>
                </select>
                {errors.gender && touched.gender ? (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *{errors.gender}
                  </p>
                ) : (
                  ""
                )}
              </div>

              <div>
                <label htmlFor="date-of-birth" className="label">
                  Date of Birth
                </label>

                <input
                  id="date-of-birth"
                  name="dateOfBirth"
                  type="date"
                  autoComplete="bday"
                  className="inputField"
                  value={values.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.dateOfBirth && touched.dateOfBirth ? (
                  <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                    *{errors.dateOfBirth}
                  </p>
                ) : (
                  ""
                )}
              </div>

              <button type="submit" className="submitBtn mt-1 min-h-12 md:col-span-2 md:mt-2">
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin block mx-auto" />
                ) : (
                  `Create Account`
                )}
              </button>
            </form>
            <p className="mt-4 text-center text-[13px] leading-5 text-gray-500 sm:mt-5 sm:text-sm">
              Already have an account?{" "}
              <Link
                to={"/login"}
                className="font-semibold text-[#16161a] border-b border-[#16161a]/[0.14] hover:border-[#16161a] transition-colors duration-150 pb-px">
                Log in
              </Link>
            </p>
            <p className="mt-4 text-center text-[13px] leading-6 text-gray-500 sm:text-sm">
              By signing up, you agree to our{" "}
              <a href="#terms" className="underline underline-offset-2">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" className="underline underline-offset-2">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
