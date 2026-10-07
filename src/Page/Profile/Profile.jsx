import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Components/Context/use.context";
import axios from "axios";
import { Calendar, Camera, UserRound, Bookmark, Users } from "lucide-react";
import PostCard from "../../Components/PostCard/PostCard";
import PostSkeleton from "../../Components/PostSkelleton/PostSkelleton";
import {
  removePostFromList,
  updateBookmarkList,
  updatePostInList,
} from "../../lib/utils";
import imageCover from "../../assets/background.jpeg";
// import { uploadProfilePhoto } from "../../Components/UserServices/UserServices";
import UpdatePhotoModal from "../../Components/UpdatePhotoModal/UpdatePhotoModal";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { getUserProfile } from "../../Components/UserServices/UserServices";
// User Skelleton as a follower
function UserRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-[#eeeeec] shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 rounded bg-[#eeeeec]" />
        <div className="h-2.5 w-20 rounded bg-[#f2f2f1]" />
      </div>
    </div>
  );
}
// Follower, Following Component
function UserRow({ user }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Link
        to={`/profile/${user._id ?? user.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16161a]/30">
        <img loading="lazy"
          src={user.photo}
          alt={user.name}
          className="w-9 h-9 rounded-full object-cover border border-[#16161a]/8 bg-[#eeeeec] shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-[#16161a] truncate">
            {user.name}
          </p>
          <p className="text-[12.5px] text-gray-500 truncate">
            @{user.username}
          </p>
        </div>
      </Link>
      <button
        type="button"
        className="shrink-0 px-3 py-1.5 rounded-lg border border-[#16161a]/8 text-[12px] font-medium text-[#16161a] hover:bg-[#f2f2f1] transition-colors duration-150">
        Follow
      </button>
    </li>
  );
}

export default function Profile() {
  const [bookMarksPosts, setBookMarksPosts] = useState(null);
  const [myPosts, setMyPosts] = useState(null);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [myPostsLoading, setMyPostsLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [followersUsers, setFollowersUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const { token, userInfo, userInfoLoading, setUserInfo } =
    useContext(UserContext);
  console.log(token);
  const userId = userInfo?.id ?? userInfo?._id;
  const {
    bookmarks,
    bookmarksCount,
    cover,
    createdAt,
    dateOfBirth,
    email,
    followers,
    followersCount,
    following,
    followingCount,
    gender,
    name,
    photo,
    username,
    _id,
  } = userInfo || {};
  async function getBookMarks() {
    setBookmarksLoading(true);
    try {
      const config = {
        url: "https://route-posts.routemisr.com/users/bookmarks",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      };
      const { data } = await axios.request(config);
      setBookMarksPosts(data.data.bookmarks);
    } catch (error) {
      console.log(error);
    } finally {
      setBookmarksLoading(false);
    }
  }
  // get followers function
  useEffect(() => {
    async function getFollowers() {
      try {
        const data = await Promise.all(
          followers.map((id) => getUserProfile(token, id)),
        );
        setFollowersUsers(data.data.users);
      } catch ({ error }) {
        console.log(error);
      }
    }

    if (followers?.length > 0) getFollowers();
  }, [followers]);

  // get following function
  useEffect(() => {
    async function getFollowing() {
      try {
        const data = await Promise.all(
          following.map((id) => getUserProfile(token, id)),
        );
        setFollowingUsers(data.data.users);
      } catch ({ error }) {
        console.log(error);
      }
    }

    if (following?.length > 0) getFollowing();
  }, [following]);

  async function getMyPosts() {
    setMyPostsLoading(true);
    try {
      const config = {
        url: `https://route-posts.routemisr.com/users/${userId}/posts`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      };
      const { data } = await axios.request(config);
      const posts = data.data.posts;
      setMyPosts(posts);
      console.log(posts);
    } catch (error) {
      console.log(error);
    } finally {
      setMyPostsLoading(false);
    }
  }
  // i will replace it by tanStack library
  function updatePost(updatedPost, wasBookmarked) {
    setMyPosts((posts) => updatePostInList(posts, updatedPost));
    setBookMarksPosts((posts) => updateBookmarkList(posts, updatedPost));

    if (wasBookmarked !== updatedPost.bookmarked) {
      setUserInfo((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              bookmarksCount: Math.max(
                0,
                (currentUser.bookmarksCount ?? 0) +
                  (updatedPost.bookmarked ? 1 : -1),
              ),
            }
          : currentUser,
      );
    }
  }

  function removePost(deletedPost) {
    setMyPosts((posts) => removePostFromList(posts, deletedPost));
    setBookMarksPosts((posts) => removePostFromList(posts, deletedPost));

    if (deletedPost.bookmarked) {
      setUserInfo((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              bookmarksCount: Math.max(
                0,
                (currentUser.bookmarksCount ?? 0) - 1,
              ),
            }
          : currentUser,
      );
    }
  }
  // upload profile photo function

  useEffect(() => {
    if (token && userId) getMyPosts();
  }, [token, userId, userInfo.photo]);

  useEffect(() => {
    if (token) getBookMarks();
  }, [token]);
  console.log(myPosts);

  console.log("followers:", userInfo.followers);
  const joinDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const TABS = [
    { key: "posts", label: "Posts" },
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
    { key: "bookmarks", label: "Bookmarks" },
  ];

  const [activeTab, setActiveTab] = useState("posts");
  if (userInfoLoading || !userInfo) {
    return (
      <Helmet>
        <title>My Profile | Social App</title>
      </Helmet>
    );
  }

  return (
    <div className="w-[calc(100%-2rem)] mx-auto pt-0 p-4">
      <Helmet>
        <title>
          {name
            ? `${name.slice(0, 2)} | Social App`
            : "My Profile | Social App"}
        </title>
      </Helmet>
      <div className="">
        {/* ===== Header card: cover + profile photo + identity ===== */}
        {/* i should make a skelleton here suitable to the profile */}
        <div className="mt-4 lg:mt-12 bg-white  rounded-2xl border border-[#16161a]/8 shadow-[0_1px_2px_rgba(15,15,16,0.04),0_10px_28px_-14px_rgba(15,15,16,0.10)] overflow-hidden">
          {/* Cover */}
          <div className="relative h-36 w-full bg-[#eeeeec] md:h-48 lg:h-60">
            <img loading="lazy"
              src={cover || imageCover}
              alt=""
              className="size-full object-cover object-center"
            />
          </div>

          {/* Identity row */}
          <div className="px-4 md:px-6 pb-5 md:pb-6 relative z-10">
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 md:-mt-14">
              <div className="relative size-20 shrink-0 sm:size-24 md:size-28">
                <img loading="lazy"
                  src={photo}
                  alt={name}
                  className="size-full rounded-full border-4 border-white bg-[#eeeeec] object-cover shadow-[0_1px_2px_rgba(15,15,16,0.04),0_10px_28px_-14px_rgba(15,15,16,0.14)]"
                />
                <button
                  onClick={() => setUploadModal(true)}
                  className="absolute bottom-0 right-0 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#16161a] text-white shadow-[0_2px_8px_rgba(22,22,26,0.2)] transition-colors hover:bg-[#303036] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#16161a]/30 focus-within:ring-offset-2 sm:size-9">
                  <Camera className="size-3 md:size-4" aria-hidden="true" />
                </button>
              </div>
              {/* <button
                type="button"
                className="cursor-pointer mb-1 px-4 py-2 rounded-[10px] border border-[#16161a] bg-[#16161a] text-white text-[12.5px] md:text-[13.5px] font-semibold tracking-[-0.005em] transition-colors duration-150 hover:bg-[#2a2a2e]">
                Edit profile
              </button> */}
            </div>

            <div className="mt-3 md:mt-4">
              <h1 className="text-[19px] md:text-[22px] font-bold text-[#16161a] tracking-[-0.01em]">
                {name}
              </h1>
              <p className="text-[13px] md:text-[14px] text-gray-500 mt-0.5">
                @{username}
              </p>
            </div>

            {/* Meta info row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 md:mt-4 text-[12.5px] md:text-[13px] text-gray-500">
              <span className="flex items-center gap-1.5 capitalize">
                <UserRound size={14} className="text-gray-400" />
                {gender}
              </span>

              {joinDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  Joined {joinDate}
                </span>
              )}
            </div>
          </div>

          {/* Stats bar — click to switch the active tab below */}
          <div className="flex items-center justify-center gap-6 md:gap-10 py-3.5 md:py-4 border-t border-[#16161a]/6 bg-[#fafafa]">
            <button
              type="button"
              onClick={() => setActiveTab("followers")}
              className={`flex flex-col items-center px-3 md:px-5 py-1 rounded-lg transition-colors duration-150 ${
                activeTab === "followers"
                  ? "text-[#16161a]"
                  : "text-gray-500 hover:text-[#16161a]"
              }`}>
              <span className="text-[16px] md:text-[18px] font-bold text-[#16161a]">
                {followersCount}
              </span>
              <span className="text-[11.5px] md:text-[12.5px]">Followers</span>
            </button>

            <div className="w-px h-8 bg-[#16161a]/8" />

            <button
              type="button"
              onClick={() => setActiveTab("following")}
              className={`flex flex-col items-center px-3 md:px-5 py-1 rounded-lg transition-colors duration-150  ${
                activeTab === "following"
                  ? "text-[#16161a]"
                  : "text-gray-500 hover:text-[#16161a]"
              }`}>
              <span className="text-[16px] md:text-[18px] font-bold text-[#16161a]">
                {followingCount}
              </span>
              <span className="text-[11.5px] md:text-[12.5px]">Following</span>
            </button>

            <div className="w-px h-8 bg-[#16161a]/8" />

            <button
              type="button"
              onClick={() => setActiveTab("bookmarks")}
              className={`flex flex-col items-center px-3 md:px-5 py-1 rounded-lg transition-colors duration-150 ${
                activeTab === "bookmarks"
                  ? "text-[#16161a]"
                  : "text-gray-500 hover:text-[#16161a]"
              }`}>
              <span className="text-[16px] md:text-[18px] font-bold text-[#16161a]">
                {bookmarksCount}
              </span>
              <span className="text-[11.5px] md:text-[12.5px]">Bookmarks</span>
            </button>
          </div>
        </div>

        <div className="w-full mx-auto mx-w-200 xl:max-w-237.5">
          {/* ===== Tab bar ===== */}
          <div className="mt-5 md:mt-6 flex items-center gap-1 bg-white rounded-xl border border-[#16161a]/8 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-center py-2 md:py-2.5 rounded-lg text-[12.5px] md:text-[13.5px] font-medium transition-colors duration-150 cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-[#eeeeec] text-[#16161a]"
                    : "text-gray-500 hover:bg-[#f2f2f1] hover:text-[#16161a]"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ===== Tab content ===== */}
          <div className="mt-4">
            {/* my posts */}
            {activeTab === "posts" &&
              (myPostsLoading ? (
                <div className="space-y-4 md:space-y-5">
                  <PostSkeleton />
                  <PostSkeleton />
                </div>
              ) : myPosts && myPosts.length > 0 ? (
                <div className="space-y-4 md:space-y-5">
                  {myPosts.map((post) => (
                    <PostCard
                      key={post._id ?? post.id}
                      post={post}
                      onPostUpdate={updatePost}
                      onPostDelete={removePost}
                      showTopComment={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-[#16161a]/8 py-14 md:py-20 px-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f2f2f1] flex items-center justify-center mb-3">
                    <Bookmark size={20} className="text-gray-400" />
                  </div>
                  <p className="text-[13.5px] md:text-[14.5px] font-medium text-[#16161a]">
                    No posts yet
                  </p>
                  <p className="text-[12.5px] md:text-[13px] text-gray-500 mt-1 max-w-70">
                    When {name?.split(" ")[0] ?? "this user"} shares something,
                    it will appear here.{" "}
                  </p>
                </div>
              ))}
            {/* --- Followers --- */}
            {activeTab === "followers" &&
              (userInfoLoading ? (
                <div className="bg-white rounded-2xl border border-[#16161a]/8 divide-y divide-[#16161a]/6">
                  <UserRowSkeleton />
                  <UserRowSkeleton />
                  <UserRowSkeleton />
                </div>
              ) : followersUsers && followersUsers.length > 0 ? (
                <ul className="bg-white rounded-2xl border border-[#16161a]/8 divide-y divide-[#16161a]/6 max-h-80 overflow-y-auto">
                  {followersUsers.map((follower) => (
                    <UserRow key={follower} user={follower} />
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-[#16161a]/8 py-14 md:py-20 px-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f2f2f1] flex items-center justify-center mb-3">
                    <Users size={20} className="text-gray-400" />
                  </div>
                  <p className="text-[13.5px] md:text-[14.5px] font-medium text-[#16161a]">
                    No followers yet
                  </p>
                  <p className="text-[12.5px] md:text-[13px] text-gray-500 mt-1 max-w-70">
                    People who follow this account will show up here.
                  </p>
                </div>
              ))}

            {/* --- Following --- */}
            {activeTab === "following" &&
              (userInfoLoading ? (
                <div className="bg-white rounded-2xl border border-[#16161a]/8 divide-y divide-[#16161a]/6">
                  <UserRowSkeleton />
                  <UserRowSkeleton />
                  <UserRowSkeleton />
                </div>
              ) : followingUsers && followingUsers.length > 0 ? (
                <ul className="bg-white rounded-2xl border border-[#16161a]/8 divide-y divide-[#16161a]/6 max-h-80 overflow-y-auto">
                  {followingUsers.map((followed) => (
                    <UserRow
                      key={followed._id ?? followed.id}
                      user={followed}
                    />
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-[#16161a]/8 py-14 md:py-20 px-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f2f2f1] flex items-center justify-center mb-3">
                    <Users size={20} className="text-gray-400" />
                  </div>
                  <p className="text-[13.5px] md:text-[14.5px] font-medium text-[#16161a]">
                    Not following anyone yet
                  </p>
                  <p className="text-[12.5px] md:text-[13px] text-gray-500 mt-1 max-w-70">
                    Accounts this user follows will show up here.
                  </p>
                </div>
              ))}

            {/* --- Bookmarks (reuses existing PostCard / PostSkeleton) --- */}
            {activeTab === "bookmarks" &&
              (bookmarksLoading ? (
                <div className="space-y-4 md:space-y-5">
                  <PostSkeleton />
                  <PostSkeleton />
                </div>
              ) : bookMarksPosts && bookMarksPosts.length > 0 ? (
                <div className="space-y-4 md:space-y-5">
                  {bookMarksPosts.map((post) => (
                    <PostCard
                      key={post._id ?? post.id}
                      post={post}
                      onPostUpdate={updatePost}
                      onPostDelete={removePost}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-[#16161a]/8 py-14 md:py-20 px-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f2f2f1] flex items-center justify-center mb-3">
                    <Bookmark size={20} className="text-gray-400" />
                  </div>
                  <p className="text-[13.5px] md:text-[14.5px] font-medium text-[#16161a]">
                    No bookmarks yet
                  </p>
                  <p className="text-[12.5px] md:text-[13px] text-gray-500 mt-1 max-w-70">
                    Posts this user saves will show up here.
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
      {uploadModal && (
        <UpdatePhotoModal
          setUploadModal={setUploadModal}
          getMyPosts={getMyPosts}
        />
      )}
      <footer className="mt-7 flex items-center justify-between border-t border-[#e9e9ed] pt-5 text-[11px] text-[#96969d]">
        <span>Social App · Account settings</span>
        <span>Privacy · Terms</span>
      </footer>
    </div>
  );
}
