import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Components/Context/use.context";
import axios from "axios";
import Loader from "../../Components/Loading/Loading";
import PostCard from "../../Components/PostCard/PostCard";
import PostSkeleton from "../../Components/PostSkelleton/PostSkelleton";
import TextSkelleton from "../../Components/TextSkelleton/TextSkelleton";
import CreatePostForm from "../../Components/CreatePostForm/CreatePostForm";
import { removePostFromList, updatePostInList } from "../../lib/utils";
import FollowingSuggestions from "../../Components/FollowingSuggestions/FollowingSuggestions";
import { Helmet } from "react-helmet-async";
import EndOfFeed from "../../Components/EndOfFeed/EndOfFeed";
export default function Home() {
  const [allPosts, setAllPosts] = useState([]);
  const { token } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  async function getPosts(refreshFirstPage = false) {
    try {
      const config = {
        url: `https://route-posts.routemisr.com/posts?limit=20&page=${refreshFirstPage ? 1 : currentPage}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      };
      const { data } = await axios.request(config);
      if (data.success) {
        const fetchedPosts = data.data.posts ?? [];
        setAllPosts((previous) => {
          const seen = new Set();
          const mergedPosts = refreshFirstPage
            ? [...fetchedPosts, ...previous]
            : [...previous, ...fetchedPosts];
          return mergedPosts.filter((post) => {
            const postId = post._id ?? post.id;
            if (seen.has(postId)) return false;
            seen.add(postId);
            return true;
          });
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsInitialLoading(false);
    }
  }

  function updatePost(updatedPost) {
    setAllPosts((currentPosts) => updatePostInList(currentPosts, updatedPost));
  }

  function removePost(deletedPost) {
    setAllPosts((posts) => removePostFromList(posts, deletedPost));
  }

  useEffect(() => {
    getPosts();
  }, [currentPage]);
  return (
    <>
      <Helmet>
        <title>Home | Social App</title>
      </Helmet>
      {!isInitialLoading ? (
        <>
          <CreatePostForm onPostCreated={getPosts} />
          <div className="grid  grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 p-2 lg:p-10">
            <div className="flex flex-col gap-4">
              {allPosts.map((post) => (
                <PostCard
                  key={post._id || post.id}
                  post={post}
                  onPostUpdate={updatePost}
                  onPostDelete={removePost}
                  showTopComment={true}
                />
              ))}
              <EndOfFeed onKeepScrolling={setCurrentPage} />
            </div>
            <div className="sticky top-20 h-fit">
              <FollowingSuggestions />
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4">
          <TextSkelleton />
          <PostSkeleton />
          <TextSkelleton />
          <PostSkeleton />
        </div>
      )}
    </>
  );
}
