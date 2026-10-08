import { Calendar, UserRound, Mail, Users } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router";
import { UserContext } from "../../Components/Context/use.context";
import {
  followUser,
  getUserProfile,
} from "../../Components/UserServices/UserServices";
import Loading from "../../Components/Loading/Loading";
import { Helmet } from "react-helmet-async";

export default function UserProfile() {
  const { id } = useParams();
  const { token, userInfo } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentProfilePath =
    (user?._id ?? user?.id) === (userInfo?._id ?? userInfo?.id)
      ? "/my-profile"
      : `/profile/${user?._id ?? user?.id ?? id}`;
  async function handleUserProfile() {
    const data = await getUserProfile(token, id);
    if (data.success) {
      setUser(data.data.user);
      setIsFollowing(data.data.isFollowing);
    }
  }
  useEffect(() => {
    handleUserProfile();
  }, [id, token]);

  async function handleFollowing() {
    const data = await followUser(token, id);
    if (data.success) {
      setIsFollowing(data.data.isFollowing);
      await handleUserProfile(); // Refresh user profile to get updated followers count and following state
    }
  }
  if (!user) {
    return (
      <>
        <Helmet>
          <title>User Profile | Social App</title>
        </Helmet>
        <Loading />
      </>
    );
  }
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";
  const birthDate = user.dateOfBirth
    ? new Date(user.dateOfBirth).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="mx-auto max-w-6xl px-2 w-[calc(100%-0.3rem)] py-5 sm:px-6 sm:py-7">
      <Helmet>
        <title>{user.name} | Social App</title>
      </Helmet>
      <article className="overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_8px_24px_rgba(22,22,26,0.06)]">
        <div className="relative h-32 overflow-hidden bg-[radial-gradient(ellipse_at_28%_18%,#ffffff_0%,#efefed_56%,#e4e4e1_100%)] sm:h-40 lg:h-48">
          {user.cover ? (
            <img
              loading="lazy"
              src={user.cover}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            !user.cover && (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_15%,rgba(255,255,255,0.9),transparent_45%)]"
              />
            )
          )}
        </div>

        <div className="px-4 pb-5 sm:px-6 sm:pb-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-end gap-3 sm:gap-4">
              <Link to={currentProfilePath} className="shrink-0">
              <img
                loading="lazy"
                src={user.photo}
                alt={`${user.name}'s profile`}
                className="size-20 shrink-0 rounded-full border-4 border-white bg-[#eeeeec] object-cover shadow-[0_8px_24px_rgba(22,22,26,0.12)] sm:size-24 lg:size-28"
              />
              </Link>
              <div className="min-w-0 pb-1">
                <Link to={currentProfilePath} className="block min-w-0">
                <h1
                  dir="auto"
                  className="truncate text-xl font-bold text-[#16161a] sm:text-2xl">
                  {user.name}
                </h1>
                <p className="mt-0.5 truncate text-sm text-[#707078] sm:text-[15px]">
                  @{user.username}
                </p>
                </Link>
              </div>
            </div>

            <button
              onClick={() => {
                handleFollowing();
              }}
              type="button"
              aria-pressed={isFollowing}
              className={`cursor-pointer inline-flex h-10 w-full shrink-0 items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16161a]/30 focus-visible:ring-offset-2 sm:mb-1 sm:w-auto ${
                isFollowing
                  ? "border border-[#e8e8e6] bg-white text-[#16161a] hover:bg-[#f7f7f6]"
                  : "bg-[#16161a] text-white shadow-[0_6px_18px_rgba(22,22,26,0.12)] hover:bg-[#303036]"
              }`}>
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>

          <div className="mt-5 grid max-w-md grid-cols-2 divide-x divide-[#e8e8e6] sm:mt-6">
            <div className="px-4 py-2 text-center sm:px-5 sm:py-3">
              <p className="text-2xl font-bold leading-none text-[#16161a] sm:text-[28px]">
                {user.followersCount}
              </p>
              <p className="mt-1.5 text-xs font-medium text-[#707078] sm:text-[13px]">
                Followers
              </p>
            </div>
            <div className="px-4 py-2 text-center sm:px-5 sm:py-3">
              <p className="text-2xl font-bold leading-none text-[#16161a] sm:text-[28px]">
                {user.followingCount}
              </p>
              <p className="mt-1.5 text-xs font-medium text-[#707078] sm:text-[13px]">
                Following
              </p>
            </div>
          </div>
        </div>
      </article>

      <div className="mt-4 grid gap-4 lg:mt-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-2xl border border-[#e8e8e6] bg-white p-4 shadow-[0_4px_16px_rgba(22,22,26,0.04)] sm:p-5">
          <h2 className="text-sm font-semibold text-[#16161a] sm:text-base">
            Profile details
          </h2>
          <dl className="mt-3 divide-y divide-[#eeeeec]">
            <div className="flex items-center gap-3 py-3">
              <UserRound
                className="size-4 shrink-0 text-[#929298]"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
                <dt className="text-xs text-[#929298]">Gender</dt>
                <dd className="mt-0.5 truncate text-sm font-medium capitalize text-[#29292d] sm:mt-0">
                  {user.gender}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Mail
                className="size-4 shrink-0 text-[#929298]"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
                <dt className="text-xs text-[#929298]">Email</dt>
                <dd className="mt-0.5 break-all text-sm font-medium text-[#29292d] sm:mt-0 sm:text-right">
                  {user.email}
                </dd>
              </div>
            </div>
            {birthDate && (
              <div className="flex items-center gap-3 py-3">
                <Calendar
                  className="size-4 shrink-0 text-[#929298]"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
                  <dt className="text-xs text-[#929298]">Date of birth</dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#29292d] sm:mt-0">
                    {birthDate}
                  </dd>
                </div>
              </div>
            )}
            {joinDate && (
              <div className="flex items-center gap-3 py-3 last:pb-0">
                <Calendar
                  className="size-4 shrink-0 text-[#929298]"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
                  <dt className="text-xs text-[#929298]">Joined</dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#29292d] sm:mt-0">
                    {joinDate}
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </section>

        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <ConnectionList
            title="Followers"
            count={user.followersCount}
            people={user.followers}
          />
          <ConnectionList
            title="Following"
            count={user.followingCount}
            people={user.following}
          />
        </div>
      </div>
    </div>
  );
}

function ConnectionList({ title, count, people }) {
  const { userInfo } = useContext(UserContext);
  const profilePath = (person) => {
    const personId = person?._id ?? person?.id;
    return personId === (userInfo?._id ?? userInfo?.id)
      ? "/my-profile"
      : `/profile/${personId}`;
  };
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_4px_16px_rgba(22,22,26,0.04)]">
      <header className="flex items-center justify-between border-b border-[#eeeeec] px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-semibold text-[#16161a]">{title}</h2>
        <span className="rounded-md bg-[#f2f2f1] px-2 py-1 text-xs font-semibold tabular-nums text-[#707078]">
          {count}
        </span>
      </header>
      {people.length > 0 ? (
        <ul className="max-h-80 divide-y divide-[#eeeeec] overflow-y-auto px-4 sm:px-5">
          {people.map((person) => (
            <li
              key={person._id ?? person.id}
              className="flex items-center gap-3 py-3">
              <Link to={profilePath(person)} className="shrink-0">
              <img
                loading="lazy"
                src={person.photo}
                alt=""
                className="size-9 shrink-0 rounded-full border border-[#16161a]/8 bg-[#f2f2f1] object-cover"
              />
              </Link>
              <Link to={profilePath(person)} dir="auto" className="min-w-0 truncate text-sm font-medium text-[#29292d] hover:underline">
                {person.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-8 text-center text-sm text-[#929298] sm:px-5">
          No {title.toLowerCase()} yet.
        </p>
      )}
    </section>
  );
}
