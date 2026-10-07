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

export default function Login() {
  const { setToken } = useContext(UserContext);
  const [incorectInputs, setIncorectInputs] = useState(false);
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
          console.log(data);
          if (data.success) {
            toast.success(data.message);
            navigate("/");
            const token = data.data.token;
            console.log(token);
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
      <main className="mainSignup min-h-screen">
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

      <section className="form-panel bg-[#f7f7f6] flex justify-center items-center p-8 md:p-12">
        <div className="w-full max-w-[340px] sm:max-w-[380px] md:w-4/5 md:max-w-[420px] lg:w-full lg:max-w-[380px] mx-auto">
          {" "}
          <h2 className="text-[#16161a] text-2xl font-bold pb-3">
            Welcome back
          </h2>
          <p className="text-gray-500 text-[12px] md:text-[14px] pb-5">
            Log in to continue to your account.
          </p>
          <form className="grid grid-cols-1 gap-3" onSubmit={handleSubmit}>
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
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="inputField"
                value={values.password}
                onChange={(e) => {
                  handleChange(e);
                  setIncorectInputs(false);
                }}
                onBlur={handleBlur}
              />
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

            <button type="submit" className="submitBtn mt-3">
              Log in
            </button>
          </form>
          <p className="mt-3 md:mt-5 text-center text-[14px] text-gray-500">
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
