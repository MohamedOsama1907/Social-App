import { Link, useNavigate } from "react-router";
import heroImage from "../../assets/hero.svg";
import logo from "../../assets/looogo.png";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import * as yup from "yup";
import { LoaderCircle } from "lucide-react";
import { Helmet } from "react-helmet";
export default function Signup() {
  const navigate = useNavigate();
  const [isUserNameExist, setIsUserNameExist] = useState(false);
  const [isEmailExist, setIsEmailExist] = useState(false);
  const passwordRegux =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
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
      .required("Date Of Birth is required"),
    gender: yup
      .string()
      .required("gender is required")
      .oneOf(["male", "female"], "gender should be female or male"),
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
        //   toast.error(error.response.data.message);
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
      <main className="mainSignup min-h-screen">
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
        <section className="form-panel bg-[#f7f7f6] flex justify-center items-center p-8 md:p-12">
          <div className="w-full max-w-85 sm:max-w-95 md:w-4/5 md:max-w-105 lg:w-full lg:max-w-4/5 mx-auto">
            {" "}
            <h2 className="text-[#16161a] text-2xl font-bold pb-3">
              Create your account
            </h2>
            <p className="text-gray-500 text-[12px] md:text-[14px] pb-5 ">
              It takes less than a minute to strated. Fill in your details
              bellow.
            </p>
            {/*             <SignupForm /> */}
            <form
              className="grid grid-cols-1 gap-3 md:grid-cols-2"
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

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  aria-describedby="password-help"
                  className="inputField"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
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

                <input
                  id="rePassword"
                  name="rePassword"
                  type="password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="inputField"
                  value={values.rePassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
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

              <button type="submit" className="submitBtn md:col-span-2 mt-3">
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin block mx-auto" />
                ) : (
                  `Create Account`
                )}
              </button>
            </form>
            <p className="mt-3 md:mt-5 text-center text-[14px] text-gray-500">
              Already have an account?{" "}
              <Link
                to={"/login"}
                className="font-semibold text-[#16161a] border-b border-[#16161a]/[0.14] hover:border-[#16161a] transition-colors duration-150 pb-px">
                Log in
              </Link>
            </p>
            <p className="mt-4 text-center text-[14px] leading-6 text-gray-500">
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
