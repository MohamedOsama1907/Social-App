import {
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  UserPlus,
  X,
} from "lucide-react";
import { UserContext } from "../Context/use.context";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { followUser } from "../UserServices/UserServices";
import { Link } from "react-router";

export default function FollowingSuggestions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestions, setSuggestions] = useState(null);
  const [followingState, setFollowingState] = useState({});
  const { token, userInfo } = useContext(UserContext);

  function handleNextPage() {
    setCurrentPage((page) => page + 1);
  }
  function handlePreviousPage() {
    if (currentPage > 1) {
      setCurrentPage((page) => page - 1);
    }
  }
  async function fetchFollowingSuggestions() {
    const config = {
      url: `https://route-posts.routemisr.com/users/suggestions?page=${currentPage}&limit=5`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    };
    const { data } = await axios.request(config);
    if (data.success) {
      const suggestions = await data.data.suggestions;
      setSuggestions(suggestions);
    }
  }
  useEffect(() => {
    fetchFollowingSuggestions();
  }, [currentPage]);

  async function handleFollowUser(person) {
    try {
      const data = await followUser(token, person._id);
      if (data.success) {
        // Use an object to keep a separate following state for each user,
        // so updating one user's state doesn't affect the other users
        /*
        {
            "123": true,
            "456": true
        }
        */
        setFollowingState((prev) => ({
          ...prev,
          [person._id]: data.data.following,
        }));
      }
    } catch (error) {
    }
  }
  function handleDismissSuggestion(personId) {
    // return array that i want to appeat after click on X
    const currentSuggestion = suggestions.filter(
      (person) => person._id !== personId,
    );
    if (currentSuggestion.length > 0) {
      setSuggestions(currentSuggestion);
    } else {
      handleNextPage();
    }
  }
  return (
    <section
      aria-labelledby="following-suggestions-title"
      className="w-full overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_8px_24px_rgba(22,22,26,0.06)]">
      <header className="border-b border-[#eeeeec] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-1 rounded-full bg-[#16161a]"
            aria-hidden="true"
          />
          <h2
            id="following-suggestions-title"
            className="text-[15px] font-semibold text-[#16161a] sm:text-base">
            People you may know
          </h2>
        </div>
        <p className="mt-1.5 pl-3 text-xs leading-5 text-[#707078] sm:text-[13px]">
          Find familiar faces from your community.
        </p>
      </header>

      <ul className="divide-y divide-[#eeeeec] px-4 sm:px-5">
        {suggestions ? (
          suggestions.map((person) => {
            const isFollowing = Boolean(followingState[person._id]);

            return (
              <li
                key={person._id}
                className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 py-3 sm:gap-3.5 sm:py-3.5">
                <Link
                  to={
                    person._id === (userInfo?._id ?? userInfo?.id)
                      ? "/my-profile"
                      : `/profile/${person._id}`
                  }
                  aria-label={`View ${person.name}'s profile`}
                  className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16161a]/30 focus-visible:ring-offset-2">
                  <img loading="lazy"
                    src={
                      person.photo ||
                      "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                    }
                    alt=""
                    className="size-10 rounded-full border border-[#16161a]/8 bg-[#f2f2f1] object-cover sm:size-11"
                  />
                </Link>

                <div className="min-w-0">
                  <Link
                    to={
                      person._id === (userInfo?._id ?? userInfo?.id)
                        ? "/my-profile"
                        : `/profile/${person._id}`
                    }
                    className="block min-w-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16161a]/30">
                    <p className="truncate text-[13px] font-semibold text-[#16161a] transition-colors hover:text-[#4b4b52] sm:text-sm">
                      {person.name}
                    </p>
                    <p className="truncate text-xs text-[#707078] transition-colors hover:text-[#16161a]">
                      @{person.username}
                    </p>
                  </Link>
                  <p className="mt-1 truncate text-[10px] text-[#929298] sm:text-[11px]">
                    {person.mutualFollowersCount > 0
                      ? `${person.mutualFollowersCount} mutual followers`
                      : `${person.followersCount ?? 0} followers`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleFollowUser(person)}
                    type="button"
                    aria-label={`Follow ${person.name}`}
                    aria-pressed={isFollowing}
                    className={`inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16161a]/30 focus-visible:ring-offset-2 sm:h-9 sm:gap-1.5 sm:px-3 sm:text-xs ${
                      isFollowing
                        ? "border-[#e8e8e6] bg-[#f7f7f6] text-[#29292d] hover:border-[#c0393f]/20 hover:bg-[#fbecec] hover:text-[#c0393f]"
                        : "border-[#16161a] bg-[#16161a] text-white hover:bg-[#303036]"
                    }`}>
                    {isFollowing ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : (
                      <UserPlus className="size-3.5" aria-hidden="true" />
                    )}
                    <span>{isFollowing ? "Following" : "Follow"}</span>
                  </button>
                  <button
                    onClick={() => handleDismissSuggestion(person._id)}
                    type="button"
                    aria-label={`Dismiss ${person.name} suggestion`}
                    className="cursor-pointer flex size-8 items-center justify-center rounded-lg text-[#929298] transition-colors hover:bg-[#f2f2f1] hover:text-[#16161a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16161a]/20 sm:size-9">
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center gap-2 px-2 py-4">
              <LoaderCircle className="animate-spin" />
              <p>loading suggestions ...</p>
            </div>
          </>
        )}
      </ul>

      <footer className="flex flex-col gap-3 border-t border-[#eeeeec] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <nav
          aria-label="Suggestion pages"
          className="flex items-center justify-center gap-2 sm:justify-end">
          <button
            onClick={() => {
              handlePreviousPage();
            }}
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            className="cursor-pointer inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#e8e8e6] bg-white px-2.5 text-[11px] font-medium text-[#16161a]  disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:px-3 sm:text-xs">
            <ChevronLeft className="size-3.5" aria-hidden="true" />
            <span>Previous</span>
          </button>
          <span
            aria-current="page"
            className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#16161a] px-2 text-xs font-semibold text-white sm:h-9 sm:min-w-9">
            {currentPage}
          </span>
          <button
            onClick={handleNextPage}
            type="button"
            aria-label="Next page"
            className="cursor-pointer inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#e8e8e6] bg-white px-2.5 text-[11px] font-medium text-[#16161a] transition-colors hover:bg-[#f7f7f6] sm:h-9 sm:px-3 sm:text-xs">
            <span>Next</span>
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </nav>
        <p className="text-center text-[11px] text-[#929298] sm:text-left sm:text-xs">
          Page {""}
          <span className="font-medium text-[#707078]">{currentPage}</span>
        </p>
      </footer>
    </section>
  );
}
