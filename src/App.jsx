import { BrowserRouter, Route, Routes } from "react-router";
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

function App() {
  return (
    <>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {/* Nested Routes to make the side bar in many pages */}

            {/*Open close tag ===> parent route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
              {/* Open close tag ===> child route 
            we mustn't write (/) in the path of children because it make an absolute path not children
            */}
              <Route
                index
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="profile/:id"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="posts/:id"
                element={
                  <ProtectedRoute>
                    <PostDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
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
