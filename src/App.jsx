import Signup from "./Page/Signup/Signup";
import Home from "./Page/Home/Home";
import Login from "./Page/Login/Login";
import Notifications from "./Page/Notifications/Notifications";
import Settings from "./Page/Settings/Settings";
import Profile from "./Page/Profile/Profile";
import NotFound from "./Page/NotFound/NotFound";
import Layout from "./Components/Layout/Layout";
import { Toaster } from "sonner";
import UserProvider from "./Components/Context/use.context";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import UserProfile from "./Page/UserProfile/UserProfile";
import PostDetails from "./Page/PostDetails/PostDetails";
import { createBrowserRouter, RouterProvider } from "react-router";
import PublicRoute from "./Components/PublicRoute/PublicRoute";
import { Detector } from "react-detect-offline";
import OfflinePage from "./Page/OfflinePage/OfflinePage";

/* Nested Routes to make the side bar in many pages */
/*Open close tag ===> parent route */
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        {" "}
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      /* Open close tag ===> child route
         we mustn't write (/) in the path of children because it make an absolute path not children
      */
      {
        index: true,
        element: <Home />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "profile/:id",
        element: <UserProfile />,
      },
      {
        path: "my-profile",
        element: <Profile />,
      },
      {
        path: "posts/postDetails/:id",
        element: <PostDetails />,
      },
      {
        path: "*",
        element: (
          <ProtectedRoute>
            {" "}
            <NotFound />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
]);
function App() {
  return (
    <>
      <UserProvider>
        <Detector
          render={({ online }) =>
            online ? <RouterProvider router={router} /> : <OfflinePage />
          }
        />

        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "bg-[#16161a]! text-white!",
            },
          }}
        />
      </UserProvider>
    </>
  );
}

export default App;
