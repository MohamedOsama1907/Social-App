import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import {
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import axios from "axios";
import { UserContext } from "../../Components/Context/use.context";

const PAGE_SIZE = 10;
const DEFAULT_PROFILE_PHOTO =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

function getNotificationId(notification) {
  return notification?._id ?? notification?.id;
}

function getNotificationList(response) {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(response?.notifications)) return response.notifications;
  return null;
}

function getNotificationReadState(notification) {
  if (typeof notification?.isRead === "boolean") return notification.isRead;
  if (typeof notification?.read === "boolean") return notification.read;
  if (typeof notification?.unread === "boolean") return !notification.unread;
  return false;
}

function getNotificationActor(notification) {
  const actor =
    notification?.actor ??
    notification?.sender ??
    notification?.user ??
    notification?.fromUser;
  return actor && typeof actor === "object" ? actor : null;
}

function getNotificationMessage(notification, actorName) {
  if (notification?.message) return notification.message;
  const type = String(
    notification?.type ?? notification?.notificationType ?? "",
  ).toLowerCase();

  if (type.includes("follow")) return `${actorName} started following you.`;
  if (type.includes("reply")) return `${actorName} replied to your comment.`;
  if (type.includes("comment")) return `${actorName} commented on your post.`;
  if (type.includes("like")) return `${actorName} liked your post.`;
  if (type.includes("share")) return `${actorName} shared your post.`;
  return `${actorName} sent you a notification.`;
}

function getNotificationIcon(notification) {
  const type = String(
    notification?.type ?? notification?.notificationType ?? "",
  ).toLowerCase();
  if (type.includes("follow")) return UserPlus;
  if (type.includes("comment") || type.includes("reply")) return MessageCircle;
  if (type.includes("like")) return Heart;
  return Bell;
}

function formatRelativeTime(value) {
  if (!value) return "";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(seconds);
  let unit = "second";
  let divisor = 1;
  if (absoluteSeconds >= 31557600) [unit, divisor] = ["year", 31557600];
  else if (absoluteSeconds >= 2629800) [unit, divisor] = ["month", 2629800];
  else if (absoluteSeconds >= 604800) [unit, divisor] = ["week", 604800];
  else if (absoluteSeconds >= 86400) [unit, divisor] = ["day", 86400];
  else if (absoluteSeconds >= 3600) [unit, divisor] = ["hour", 3600];
  else if (absoluteSeconds >= 60) [unit, divisor] = ["minute", 60];
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
    Math.round(seconds / divisor),
    unit,
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex animate-pulse gap-3 rounded-2xl border border-[#e8e8e6] bg-white px-4 py-5 shadow-[0_3px_12px_rgba(22,22,26,0.03)] sm:px-6">
          <span className="size-11 shrink-0 rounded-full bg-[#eeeeec]" />
          <div className="flex-1 space-y-2 py-1">
            <span className="block h-3.5 w-3/4 rounded bg-[#eeeeec]" />
            <span className="block h-3 w-1/3 rounded bg-[#f2f2f1]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Notifications() {
  const {
    token,
    userInfo,
    unreadNotificationCount,
    setUnreadNotificationCount,
  } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [pendingReadIds, setPendingReadIds] = useState(() => new Set());
  const [errorMessage, setErrorMessage] = useState("");
  const requestPending = useRef(false);
  const pendingReadIdsRef = useRef(new Set());

  async function loadNotifications(page, append = false) {
    if (requestPending.current) return;
    requestPending.current = true;
    setErrorMessage("");
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const { data } = await axios.request({
        url: `https://route-posts.routemisr.com/notifications?unread=false&page=${page}&limit=${PAGE_SIZE}`,
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      if (data?.success === false) {
        throw new Error(data.message || "Could not load notifications.");
      }
      const fetchedNotifications = getNotificationList(data);
      if (!fetchedNotifications) {
        throw new Error("The notifications response could not be read.");
      }

      if (append) {
        setNotifications((previous) => {
          const seenIds = new Set(
            previous
              .map(getNotificationId)
              .filter((notificationId) => notificationId != null),
          );
          const nextBatch = fetchedNotifications.filter((notification) => {
            const notificationId = getNotificationId(notification);
            if (notificationId == null) return true;
            if (seenIds.has(notificationId)) return false;
            seenIds.add(notificationId);
            return true;
          });
          return [...previous, ...nextBatch];
        });
      } else {
        setNotifications(fetchedNotifications);
      }
      setCurrentPage(page);
      setHasMore(fetchedNotifications.length === PAGE_SIZE);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Could not load notifications. Please try again.",
      );
    } finally {
      requestPending.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    if (token) loadNotifications(1);
  }, [token]);

  async function handleMarkAsRead(notification) {
    const notificationId = getNotificationId(notification);
    if (
      !notificationId ||
      getNotificationReadState(notification) ||
      pendingReadIdsRef.current.has(notificationId) ||
      isMarkingAll
    ) {
      return;
    }

    pendingReadIdsRef.current.add(notificationId);
    setPendingReadIds(new Set(pendingReadIdsRef.current));
    try {
      const { data } = await axios.request({
        url: `https://route-posts.routemisr.com/notifications/${notificationId}/read`,
        headers: { Authorization: `Bearer ${token}` },
        method: "PATCH",
      });
      if (data?.success === false) {
        throw new Error(data.message || "Could not mark notification as read.");
      }

      setNotifications((previous) =>
        previous.map((item) =>
          getNotificationId(item) === notificationId
            ? { ...item, isRead: true, read: true, unread: false }
            : item,
        ),
      );
      setUnreadNotificationCount((count) => Math.max(0, count - 1));
    } catch (error) {
    } finally {
      pendingReadIdsRef.current.delete(notificationId);
      setPendingReadIds(new Set(pendingReadIdsRef.current));
    }
  }

  async function handleMarkAllAsRead() {
    if (isMarkingAll || unreadNotificationCount === 0) return;
    setIsMarkingAll(true);
    try {
      const { data } = await axios.request({
        url: "https://route-posts.routemisr.com/notifications/read-all",
        headers: { Authorization: `Bearer ${token}` },
        method: "PATCH",
      });
      if (data?.success === false) {
        throw new Error(
          data.message || "Could not mark notifications as read.",
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
          read: true,
          unread: false,
        })),
      );
      setUnreadNotificationCount(0);
    } catch (error) {
    } finally {
      setIsMarkingAll(false);
    }
  }

  function getActorProfilePath(actor, notification) {
    const actorId =
      actor?._id ??
      actor?.id ??
      notification?.actorId ??
      notification?.senderId;
    if (!actorId) return null;
    return String(actorId) === String(userInfo?._id ?? userInfo?.id)
      ? "/my-profile"
      : `/profile/${actorId}`;
  }

  function getRelatedPost(notification) {
    const relatedPost =
      notification?.post ?? notification?.entity?.post ?? null;
    const post =
      relatedPost && typeof relatedPost === "object" ? relatedPost : null;
    const entityType = String(notification?.entityType ?? "").toLowerCase();
    const postId =
      post?._id ??
      post?.id ??
      (typeof relatedPost === "string" ? relatedPost : null) ??
      notification?.postId ??
      notification?.comment?.postId ??
      notification?.reply?.postId ??
      (entityType === "post" ? notification?.entityId : null);
    return { post, postId };
  }

  return (
    <>
      <Helmet>
        <title>Notifications | Social App</title>
      </Helmet>
      <main className="min-h-[calc(100vh-4rem)] bg-[#fafaf9] pb-10 ">
        <div className="w-[calc(100%-0.3rem)] lg:w-[calc(100%-2rem)] mx-auto pt-6 lg:pt-10 p-2 lg:p-5">
          <header className="relative mb-5 flex flex-col gap-4 overflow-hidden rounded-3xl border border-[#e8e8e6] bg-gradient-to-br from-white via-white to-[#f3f2f8] p-4 shadow-[0_8px_28px_rgba(22,22,26,0.05)] sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-10 place-items-center rounded-2xl bg-[#16161a] text-white shadow-[0_5px_14px_rgba(22,22,26,0.16)]">
                  <Bell size={18} aria-hidden="true" />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#929298]">
                  Your activity
                </p>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#16161a] sm:text-[28px]">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-[#707078]">
                Updates from the people and posts you care about.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
              <span className="rounded-full border border-[#e8e8e6] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#424249] shadow-sm">
                {unreadNotificationCount} unread
              </span>
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={
                  isMarkingAll ||
                  unreadNotificationCount === 0 ||
                  pendingReadIds.size > 0
                }
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[#e8e8e6] bg-white px-3 text-xs font-semibold text-[#424249] transition-colors hover:bg-[#f7f7f6] disabled:cursor-not-allowed disabled:opacity-50">
                {isMarkingAll ? (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-[#d8d8d5] border-t-[#16161a]" />
                ) : (
                  <CheckCheck size={15} aria-hidden="true" />
                )}
                Mark all as read
              </button>
            </div>
          </header>

          <section aria-label="Notifications" className="space-y-3">
            {isLoading ? (
              <NotificationSkeleton />
            ) : errorMessage && notifications.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-14 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-[#f2f2f1] text-[#707078]">
                  <Bell size={21} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-[#16161a]">
                  Notifications couldn’t be loaded
                </h2>
                <p className="mt-1 max-w-sm text-xs leading-5 text-[#707078]">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() => loadNotifications(1)}
                  className="mt-4 inline-flex min-h-9 cursor-pointer items-center rounded-lg bg-[#16161a] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#303036]">
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-14 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-[#f2f2f1] text-[#707078]">
                  <Bell size={21} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-[#16161a]">
                  You’re all caught up
                </h2>
                <p className="mt-1 max-w-sm text-xs leading-5 text-[#707078]">
                  When people interact with you, you’ll find their updates here.
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {notifications.map((notification, index) => {
                    const notificationId = getNotificationId(notification);
                    const isRead = getNotificationReadState(notification);
                    const actor = getNotificationActor(notification);
                    const actorName =
                      actor?.name ?? actor?.username ?? "Someone";
                    const actorProfilePath = getActorProfilePath(
                      actor,
                      notification,
                    );
                    const Icon = getNotificationIcon(notification);
                    const { post, postId } = getRelatedPost(notification);
                    const message = getNotificationMessage(
                      notification,
                      actorName,
                    );
                    const timestamp =
                      notification?.createdAt ??
                      notification?.updatedAt ??
                      notification?.timestamp;
                    const content =
                      post?.body ?? post?.content ?? notification?.postPreview;
                    const postImage =
                      post?.image ?? post?.imageUrl ?? notification?.postImage;
                    const postPreview = (
                      <>
                        {postImage && (
                          <img
                            src={postImage}
                            alt=""
                            className="mb-2 max-h-40 w-full rounded-lg object-cover"
                          />
                        )}
                        {content ? (
                          <span className="line-clamp-2 break-words text-[#424249]">
                            {content}
                          </span>
                        ) : postId && !postImage ? (
                          <span>View related post</span>
                        ) : null}
                      </>
                    );

                    return (
                      <li
                        key={
                          notificationId ??
                          `${timestamp ?? "notification"}-${index}`
                        }
                        className={`relative flex min-w-0 gap-3 overflow-hidden rounded-2xl border px-4 py-4 shadow-[0_3px_12px_rgba(22,22,26,0.035)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(22,22,26,0.075)] sm:gap-4 sm:px-6 sm:py-5 ${isRead ? "border-[#e8e8e6] bg-white" : "border-[#dedee3] bg-gradient-to-r from-[#f7f7fa] to-white"}`}>
                        {!isRead && (
                          <span
                            className="absolute bottom-0 left-0 top-0 w-1 bg-[#16161a]"
                            aria-label="Unread"
                          />
                        )}
                        <div className="relative ml-1 size-11 shrink-0 sm:size-12">
                          {actorProfilePath ? (
                            <Link
                              to={actorProfilePath}
                              aria-label={`View ${actorName}'s profile`}>
                              <img
                                src={
                                  actor?.photo ??
                                  actor?.avatar ??
                                  DEFAULT_PROFILE_PHOTO
                                }
                                alt=""
                                className="size-11 rounded-full bg-[#f2f2f1] object-cover sm:size-12"
                              />
                            </Link>
                          ) : (
                            <img
                              src={DEFAULT_PROFILE_PHOTO}
                              alt=""
                              className="size-11 rounded-full bg-[#f2f2f1] object-cover sm:size-12"
                            />
                          )}
                          <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-white bg-[#16161a] text-white shadow-sm">
                            <Icon size={10} aria-hidden="true" />
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="break-words text-[13px] leading-5 text-[#424249] sm:text-sm">
                                {notification?.message ? (
                                  notification.message
                                ) : (
                                  <>
                                    {actorProfilePath ? (
                                      <Link
                                        to={actorProfilePath}
                                        className="font-semibold text-[#16161a] hover:underline">
                                        {actorName}
                                      </Link>
                                    ) : (
                                      <span className="font-semibold text-[#16161a]">
                                        {actorName}
                                      </span>
                                    )}{" "}
                                    {message.replace(`${actorName} `, "")}
                                  </>
                                )}
                              </p>
                              {timestamp && (
                                <time
                                  dateTime={timestamp}
                                  className="mt-1 block text-[11px] text-[#929298]">
                                  {formatRelativeTime(timestamp)}
                                </time>
                              )}
                            </div>
                            {!isRead && (
                              <button
                                type="button"
                                aria-label="Mark notification as read"
                                onClick={() => handleMarkAsRead(notification)}
                                disabled={
                                  !notificationId ||
                                  pendingReadIds.has(notificationId) ||
                                  isMarkingAll
                                }
                                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-[#707078] transition-colors hover:bg-[#f2f2f1] hover:text-[#16161a] disabled:cursor-wait disabled:opacity-50">
                                {pendingReadIds.has(notificationId) ? (
                                  <span className="size-3.5 animate-spin rounded-full border-2 border-[#d8d8d5] border-t-[#16161a]" />
                                ) : (
                                  <Check size={16} aria-hidden="true" />
                                )}
                              </button>
                            )}
                          </div>

                          {(postId || content || postImage) &&
                            (postId ? (
                              <Link
                                to={`/posts/postDetails/${postId}`}
                                onClick={() => handleMarkAsRead(notification)}
                                className="mt-3 block max-w-xl rounded-xl border border-[#eeeeec] bg-[#fafaf9] px-3.5 py-3 text-xs text-[#707078] transition-colors hover:border-[#d8d8d5] hover:bg-white">
                                {postPreview}
                              </Link>
                            ) : (
                              <div className="mt-3 block max-w-xl rounded-xl border border-[#eeeeec] bg-[#fafaf9] px-3.5 py-3 text-xs text-[#707078]">
                                {postPreview}
                              </div>
                            ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {errorMessage && (
                  <div className="flex flex-col gap-2 border-t border-[#eeeeec] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="text-xs text-[#c0393f]">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => loadNotifications(currentPage + 1, true)}
                      className="cursor-pointer text-left text-xs font-semibold text-[#16161a] underline underline-offset-2">
                      Retry loading more
                    </button>
                  </div>
                )}

                {hasMore && !errorMessage && (
                  <div className="border-t border-[#eeeeec] px-4 py-4 text-center sm:px-6">
                    <button
                      type="button"
                      onClick={() => loadNotifications(currentPage + 1, true)}
                      disabled={isLoadingMore}
                      className="inline-flex min-h-10 min-w-36 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e8e8e6] bg-white px-4 text-xs font-semibold text-[#424249] transition-colors hover:bg-[#f7f7f6] disabled:cursor-wait disabled:opacity-60">
                      {isLoadingMore && (
                        <span className="size-3.5 animate-spin rounded-full border-2 border-[#d8d8d5] border-t-[#16161a]" />
                      )}
                      {isLoadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default Notifications;
