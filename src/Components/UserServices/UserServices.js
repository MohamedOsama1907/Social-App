import axios from "axios";

// put follow, unFollow
export async function followUser(token, userId) {
  const { data } = await axios.request({
    url: `https://route-posts.routemisr.com/users/${userId}/follow`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "PUT",
  });

  return data;
}

// get user profileDetails
export async function getUserProfile(token, userId) {
  const { data } = await axios.request({
    url: `https://route-posts.routemisr.com/users/${userId}/profile`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "GET",
  });

  return data;
}

// get user posts
export async function getUserPosts(token, userId) {
  const { data } = await axios.request({
    url: `https://route-posts.routemisr.com/users/${userId}/posts`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "GET",
  });

  return data;
}

// Upload profile photo
export async function uploadProfilePhoto(token, formData) {
  const { data } = await axios.request({
    url: "https://route-posts.routemisr.com/users/upload-photo",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "PUT",
    data: formData,
  });
  return data;
}

// create post
export async function createPost(token, formData) {
  const { data } = await axios.request({
    url: "https://route-posts.routemisr.com/posts",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "POST",
    data: formData,
  });
  return data;
}

// change password function
export async function changePassword(token, currentPassword, newPassword) {
  const { data } = await axios.request({
    url: "https://route-posts.routemisr.com/users/change-password",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
    data: {
      password: currentPassword,
      newPassword: newPassword,
    },
  });

  return data;
}

// // get user profile data
// export async function getUserInfo(token , userId) {
//   const config = {
//     url: `https://route-posts.routemisr.com/users/${userId}/profile-data`,
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     method: "GET",
//   };
//   const { data } = await axios.request(config);
//   return data;
// }
