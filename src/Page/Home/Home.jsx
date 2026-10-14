import { useContext } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { UserContext } from "../../Components/Context/use.context";
import PostCard from "../../Components/PostCard/PostCard";
import PostSkeleton from "../../Components/PostSkelleton/PostSkelleton";
import TextSkelleton from "../../Components/TextSkelleton/TextSkelleton";
import CreatePostForm from "../../Components/CreatePostForm/CreatePostForm";
import FollowingSuggestions from "../../Components/FollowingSuggestions/FollowingSuggestions";
import EndOfFeed from "../../Components/EndOfFeed/EndOfFeed";
import { updatePostInList, removePostFromList } from "../../lib/utils";
import { Helmet } from "react-helmet-async";

const POSTS_LIMIT = 20;

export default function Home() {
  const { token } = useContext(UserContext);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["getAllPosts"],

      queryFn: async ({ pageParam }) => {
        const { data } = await axios.get(
          `https://route-posts.routemisr.com/posts?limit=${POSTS_LIMIT}&page=${pageParam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!data.success) {
          throw new Error("Failed to fetch posts");
        }

        return data.data.posts ?? [];
      },

      initialPageParam: 1,
      // Determines the next page to fetch based on the last page's posts count.
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === POSTS_LIMIT
          ? allPages.length + 1
          : undefined;
      },

      enabled: Boolean(token),
      refetchOnMount: false,
    });
  // data is => {pages: Array(1), pageParams: Array(1)}
  /* 
   pages: [
    [post1, post2, post3], // Page 1
    [post4, post5, post6], // Page 2
  ],
  */
  const allPosts = data?.pages.flat()|| []; // .flat => to combine the arrays into one array

  // Refresh the feed after creating a post.
  const handlePostCreated = () => {
    queryClient.invalidateQueries({
      queryKey: ["getAllPosts"],
    });
  };

  // Update the cached post without maintaining a separate posts state.
  const handlePostUpdate = (updatedPost) => {
    queryClient.setQueryData(["getAllPosts"], (oldData) => {
      if (!oldData) return oldData;

      /* 
      oldData.pages = [
          [post1, post2], 
          [post3, post4], 
      ];
      */
      return {
        ...oldData,
        pages: oldData.pages.map((posts) =>
          updatePostInList(posts, updatedPost),
        ),
      };
    });
  };

  // Remove the deleted post from every cached page.
  const handlePostDelete = (deletedPost) => {
    queryClient.setQueryData(["getAllPosts"], (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((posts) =>
          removePostFromList(posts, deletedPost),
        ),
      };
    });
  };

  if (isLoading) {
    return (
      <div className="mt-4">
        <TextSkelleton />
        <PostSkeleton />
        <TextSkelleton />
        <PostSkeleton />
      </div>
    );
  }

  // if (isError) {
  //   return (
  //     <div className="p-6 text-center">
  //       <p className="mb-3 text-red-500">
  //         {axios.isAxiosError(error)
  //           ? error.response?.data?.message || error.message
  //           : error.message}
  //       </p>

  //       <button
  //         onClick={() => refetch()}
  //         className="rounded-lg bg-[#16161a] px-4 py-2 text-white">
  //         Try Again
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <>
      <Helmet>
        <title>Home | Social App</title>
      </Helmet>

      <CreatePostForm onPostCreated={handlePostCreated} />

      <div className="grid grid-cols-1 gap-4 p-2 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:p-10">
        <div className="flex flex-col gap-4">
          {allPosts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
              showTopComment={true}
            />
          ))}

          {hasNextPage && (
            <EndOfFeed
              onKeepScrolling={() => {
                if (!isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
            />
          )}

          {isFetchingNextPage && (
            <>
              <TextSkelleton />
              <PostSkeleton />
            </>
          )}
        </div>

        <div className="h-fit lg:sticky lg:top-20">
          <FollowingSuggestions />
        </div>
      </div>
    </>
  );
}
