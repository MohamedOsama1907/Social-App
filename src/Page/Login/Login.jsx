import { Link, useNavigate } from "react-router";
import heroImage from "../../assets/hero.svg";
import logo from "../../assets/looogo.png";
import * as yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import { toast } from "sonner";
import { useContext, useState } from "react";
import { UserContext } from "../../Components/Context/use.context";
import { Helmet } from "react-helmet-async";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { setToken } = useContext(UserContext);
  const [incorectInputs, setIncorectInputs] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const passwordRegux =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  const schema = yup.object({
    email: yup
      .string()
      .required("email is required")
      .email("email is not valid"),
    password: yup
      .string()
      .required("password is required")
      .matches(passwordRegux, "password must be strong"),
  });
  const { values, handleSubmit, handleChange, errors, touched, handleBlur } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
      },
      validationSchema: schema,
      onSubmit: async function (values) {
        try {
          const config = {
            url: "https://route-posts.routemisr.com/users/signin",
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            data: values,
          };
          const { data } = await axios.request(config);
          if (data.success) {
            toast.success(data.message);
            navigate("/");
            const token = data.data.token;
            sessionStorage.setItem("token", token);
            setToken(token);
          }
        } catch (error) {
          if (error.response.data.message === "incorrect email or password") {
            setIncorectInputs(true);
          }
        }
      },
    });

  return (
    <>
      <Helmet>
        <title>Log In | Social App</title>
      </Helmet>
      <main className="mainSignup min-h-screen grid-rows-[minmax(220px,0.7fr)_auto] md:grid-rows-1">
      <section className="art-panel relative">
        <div className="relative z-10 flex space-x-2">
          <Link to={"/login"} className="logo flex items-center space-x-3">
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
          <img loading="lazy" src={heroImage} alt="" className="w-1/2 md:w-3/4" />
        </div>

        <div className="relative z-10 mt-auto hidden max-w-[83.333%] lg:block md:max-w-3/4">
          <h2 className="text-[#16161a] text-xl md:text-2xl font-bold py-2 md:py-4">
            Good to see you again
          </h2>
          <p className="hidden lg:block text-gray-500 text-[12px] md:text-sm">
            Log back in to catch up with your circles, your conversations, and
            everything you follow.
          </p>
        </div>

        <div className="rightDividerLine" />
        <div className="bottomDividerLine" />
      </section>

      <section className="form-panel flex min-w-0 items-start justify-center bg-[#f7f7f6] px-5 py-8 sm:px-8 sm:py-10 md:items-center md:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-[440px]">
          {" "}
          <h2 className="pb-2 text-2xl font-bold tracking-tight text-[#16161a] sm:pb-3 sm:text-[28px]">
            Welcome back
          </h2>
          <p className="pb-5 text-[13px] leading-5 text-gray-500 sm:pb-6 sm:text-sm">
            Log in to continue to your account.
          </p>
          <form className="grid grid-cols-1 gap-5" onSubmit={handleSubmit}>
            <div>
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
                onChange={(e) => {
                  handleChange(e);
                  setIncorectInputs(false);
                }}
                onBlur={handleBlur}
              />
              {errors.email && touched.email ? (
                <p className="mt-1 text-[13px] text-[#dc2626] bg-transparent">
                  *{errors.email}
                </p>
              ) : (
                ""
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="inputField pr-11"
                  value={values.password}
                  onChange={(e) => {
                    handleChange(e);
                    setIncorectInputs(false);
                  }}
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
                ""
              )}
              {incorectInputs && (
                <p className="mt-2 text-[13px] text-[#dc2626] bg-transparent">
                  *incorrect email or password
                </p>
              )}
              <div className="ml-auto w-fit mt-1">
                <Link
                  to={"/forgot-password"}
                  className="text-[12px] md:text-[13px] text-gray-500 hover:text-[#16161a] transition-colors duration-150 ">
                  Forgot password?
                </Link>
              </div>
            </div>

              <button type="submit" className="submitBtn mt-1 min-h-12">
              Log in
            </button>
          </form>
          <p className="mt-4 text-center text-[13px] leading-5 text-gray-500 sm:mt-5 sm:text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to={"/signup"}
              className="font-semibold text-[#16161a] border-b border-[#16161a]/[0.14] hover:border-[#16161a] transition-colors duration-150 pb-px">
              Sign up
            </Link>
          </p>
        </div>
      </section>
      </main>
    </>
  );
}
