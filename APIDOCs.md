# 📚 API Documentation

## 🌐 Base URL

```http
http://localhost:5000/api
```

---

# 🔐 Authentication

Protected routes require a JWT token in the request header:

```http
Authorization: Bearer <your_jwt_token>
```

---

# 👤 User Endpoints

---

## 1. User Sign Up

### Endpoint

```http
POST /user/signup
```

### Content-Type

```http
multipart/form-data
```

### Form Data

| Field        | Type   | Required | Description           |
| ------------ | ------ | -------- | --------------------- |
| userName     | string | ✅       | Unique username       |
| email        | string | ✅       | User email            |
| password     | string | ✅       | Password              |
| name         | string | ✅       | Full name             |
| profession   | string | ❌       | Professional title    |
| accountType  | string | ❌       | Account category      |
| profileImage | file   | ❌       | Profile picture       |
| document     | file   | ❌       | Verification document |

### Response — `201 Created`

```json
{
  "message": "User created successfully",
  "user": {
    "_id": "user_id",
    "userName": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "profileUrl": "cloudinary_url",
    "verified": false
  },
  "activeToken": "jwt_token"
}
```

---

## 2. User Sign In

### Endpoint

```http
POST /user/signin
```

### Request Body

#### Using Username

```json
{
  "userName": "johndoe",
  "password": "password123"
}
```

#### OR Using Email

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response — `200 OK`

```json
{
  "message": "User logged in",
  "userData": {
    "_id": "user_id",
    "userName": "johndoe",
    "email": "john@example.com",
    "profileUrl": "cloudinary_url"
  },
  "activeToken": "jwt_token"
}
```

---

## 3. Get Current User 🔒

### Endpoint

```http
GET /user/me
```

### Headers

```http
Authorization: Bearer <token>
```

### Response — `200 OK`

```json
{
  "message": "Current user retrieved successfully",
  "user": {
    "_id": "user_id",
    "userName": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "followers": 5,
    "following": 10
  }
}
```

---

## 4. Get User Profile

### Endpoint

```http
GET /user/profile/:userName
```

### Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| userName  | string | Username to fetch |

### Response — `200 OK`

```json
{
  "message": "User profile retrieved successfully",
  "profile": {
    "_id": "user_id",
    "userName": "johndoe",
    "name": "John Doe",
    "profession": "Software Engineer",
    "profileUrl": "cloudinary_url",
    "verified": true,
    "followers": 150,
    "following": 45
  }
}
```

---

## 5. Get All Users 🔒

### Endpoint

```http
GET /user/all?search=john
```

### Query Parameters

| Parameter | Type   | Description                             |
| --------- | ------ | --------------------------------------- |
| search    | string | Search by name, username, or profession |

### Response — `200 OK`

```json
{
  "message": "Discovery users list retrieved successfully",
  "users": [
    {
      "_id": "user_id",
      "userName": "johndoe",
      "name": "John Doe",
      "profession": "Engineer",
      "profileUrl": "url"
    }
  ]
}
```

---

## 6. Update User Profile 🔒

### Endpoint

```http
POST /user/profile
```

### Content-Type

```http
multipart/form-data
```

### Form Data

| Field        | Type   | Required | Description                     |
| ------------ | ------ | -------- | ------------------------------- |
| name         | string | ❌       | Updated name                    |
| userName     | string | ❌       | Updated username                |
| profession   | string | ❌       | Updated profession              |
| oldPassword  | string | ❌       | Required when changing password |
| newPassword  | string | ❌       | New password                    |
| profileImage | file   | ❌       | Updated profile image           |

### Response — `200 OK`

```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "userName": "johndoe_updated",
    "name": "John Updated"
  },
  "profileUrl": "new_cloudinary_url"
}
```

---

## 7. Request Verification 🔒

### Endpoint

```http
POST /user/request-verification
```

### Content-Type

```http
multipart/form-data
```

### Form Data

| Field    | Type | Required | Description           |
| -------- | ---- | -------- | --------------------- |
| document | file | ✅       | Verification document |

### Response — `200 OK`

```json
{
  "message": "Verification document uploaded successfully. Awaiting admin review.",
  "documentUrl": "cloudinary_url"
}
```

---

## 8. Get My Posts 🔒

### Endpoint

```http
GET /user/myPosts
```

### Response — `200 OK`

```json
{
  "posts": [
    {
      "_id": "post_id",
      "title": "Post Title",
      "content": "Post content",
      "user": {
        "userName": "johndoe",
        "name": "John Doe"
      },
      "createdAt": "2026-05-28T12:00:00Z"
    }
  ]
}
```

---

# 📝 Post Endpoints

---

## 1. Create Post 🔒

### Endpoint

```http
POST /post/upload
```

### Content-Type

```http
multipart/form-data
```

### Form Data

| Field     | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| title     | string | ✅       | Post title                      |
| content   | string | ✅       | Post content                    |
| category  | string | ❌       | health, education, social, etc. |
| postImage | file   | ❌       | Post image                      |

### Response — `201 Created`

```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "post_id",
    "title": "Discussing Health Topics",
    "content": "Content here...",
    "user": "user_id",
    "imageUrl": "cloudinary_url",
    "likes": 0,
    "comments": 0,
    "createdAt": "2026-05-28T12:00:00Z"
  }
}
```

---

## 2. Get All Posts

### Endpoint

```http
GET /post/allPost?page=1&limit=10
```

### Query Parameters

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| page      | number | Page number        |
| limit     | number | Posts per page     |
| category  | string | Filter by category |

### Response — `200 OK`

```json
{
  "posts": [
    {
      "_id": "post_id",
      "title": "Post Title",
      "content": "Content",
      "user": {
        "userName": "johndoe",
        "profileUrl": "url"
      },
      "likes": 5,
      "comments": 3,
      "createdAt": "2026-05-28T12:00:00Z"
    }
  ],
  "total": 100,
  "pages": 10
}
```

---

## 3. Get Single Post

### Endpoint

```http
GET /post/singlePost/:postId
```

### Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| postId    | string | Post ID     |

### Response — `200 OK`

```json
{
  "post": {
    "_id": "post_id",
    "title": "Post Title",
    "content": "Full content",
    "user": {
      "_id": "user_id",
      "userName": "johndoe",
      "profileUrl": "url",
      "verified": true
    },
    "likes": 10,
    "comments": [
      {
        "_id": "comment_id",
        "content": "Great post!",
        "user": "user_id"
      }
    ],
    "createdAt": "2026-05-28T12:00:00Z"
  }
}
```

---

## 4. Edit Post 🔒

### Endpoint

```http
PUT /post/editPost/:postId
```

### Content-Type

```http
multipart/form-data
```

### Parameters

| Parameter | Type   | Description     |
| --------- | ------ | --------------- |
| postId    | string | Post ID to edit |

### Form Data

| Field     | Type   | Required |
| --------- | ------ | -------- |
| title     | string | ❌       |
| content   | string | ❌       |
| postImage | file   | ❌       |

### Response — `200 OK`

```json
{
  "message": "Post updated successfully",
  "post": {
    "_id": "post_id",
    "title": "Updated Title",
    "content": "Updated content"
  }
}
```

---

## 5. Delete Post 🔒

### Endpoint

```http
DELETE /post/deletePost/:postId
```

### Response — `200 OK`

```json
{
  "message": "Post deleted successfully"
}
```

---

# 💬 Comment Endpoints

---

## 1. Create Comment 🔒

### Endpoint

```http
POST /comment/postComment/:postId
```

### Request Body

```json
{
  "content": "This is a great post!",
  "parentCommentId": null
}
```

### Response — `201 Created`

```json
{
  "message": "Comment posted successfully",
  "comment": {
    "_id": "comment_id",
    "content": "This is a great post!",
    "user": "user_id",
    "post": "post_id",
    "parentComment": null,
    "replies": [],
    "likes": 0,
    "createdAt": "2026-05-28T12:00:00Z"
  }
}
```

---

## 2. Reply to Comment 🔒

### Endpoint

```http
POST /comment/postComment/:postId/:ParentcommentId
```

### Request Body

```json
{
  "content": "I agree with this!"
}
```

### Response — `201 Created`

```json
{
  "message": "Reply posted successfully",
  "comment": {
    "_id": "comment_id",
    "content": "I agree with this!",
    "parentComment": "parent_comment_id",
    "createdAt": "2026-05-28T12:00:00Z"
  }
}
```

---

## 3. Get All Comments for Post

### Endpoint

```http
GET /comment/getAllComment/:postId
```

### Response — `200 OK`

```json
{
  "comments": [
    {
      "_id": "comment_id",
      "content": "Great discussion!",
      "user": {
        "userName": "johndoe",
        "profileUrl": "url"
      },
      "replies": 2,
      "likes": 5,
      "createdAt": "2026-05-28T12:00:00Z"
    }
  ]
}
```

---

## 4. Get Single Comment

### Endpoint

```http
GET /comment/getComment/:commentId
```

### Response — `200 OK`

```json
{
  "comment": {
    "_id": "comment_id",
    "content": "Comment content",
    "user": {
      "userName": "johndoe",
      "profileUrl": "url"
    },
    "likes": 3,
    "replies": []
  }
}
```

---

## 5. Get My Comments 🔒

### Endpoint

```http
GET /comment/myComments
```

### Response — `200 OK`

```json
{
  "comments": [
    {
      "_id": "comment_id",
      "content": "My comment",
      "post": "post_id",
      "createdAt": "2026-05-28T12:00:00Z"
    }
  ]
}
```

---

## 6. Edit Comment 🔒

### Endpoint

```http
PUT /comment/editComment/:postId/:commentId
```

### Request Body

```json
{
  "content": "Updated comment content"
}
```

### Response — `200 OK`

```json
{
  "message": "Comment updated successfully",
  "comment": {
    "_id": "comment_id",
    "content": "Updated comment content"
  }
}
```

---

## 7. Delete Comment 🔒

### Endpoint

```http
DELETE /comment/deleteComment/:commentId
```

### Response — `200 OK`

```json
{
  "message": "Comment deleted successfully"
}
```

---

# 👍 Vote Endpoints

---

## Vote on Post 🔒

### Endpoint

```http
POST /vote/toggleVote/:postId
```

### Request Body

```json
{
  "voteType": "upvote"
}
```

### Response — `200 OK`

```json
{
  "message": "Vote recorded",
  "vote": {
    "postId": "post_id",
    "userId": "user_id",
    "voteType": "upvote"
  }
}
```

---

# 👥 Follow Endpoints

---

## 1. Follow User 🔒

### Endpoint

```http
POST /follow/followUser/:userId
```

### Response — `200 OK`

```json
{
  "message": "User followed successfully"
}
```

---

## 2. Unfollow User 🔒

### Endpoint

```http
POST /follow/unfollowUser/:userId
```

### Response — `200 OK`

```json
{
  "message": "User unfollowed successfully"
}
```

---

# 💌 Message Endpoints

---

## 1. Send Message 🔒

### Endpoint

```http
POST /message/send/:receiverId
```

### Request Body

```json
{
  "content": "Hello! How are you?"
}
```

### Response — `201 Created`

```json
{
  "message": {
    "_id": "message_id",
    "sender": "user_id",
    "receiver": "receiver_id",
    "content": "Hello! How are you?",
    "timestamp": "2026-05-28T12:00:00Z"
  }
}
```

---

## 2. Get Conversation 🔒

### Endpoint

```http
GET /message/getConversation/:userId
```

### Response — `200 OK`

```json
{
  "messages": [
    {
      "_id": "message_id",
      "sender": "user_id",
      "content": "Hello!",
      "timestamp": "2026-05-28T12:00:00Z"
    }
  ]
}
```

---

# 🚩 Report Endpoints

---

## Report Content 🔒

### Endpoint

```http
POST /report/reportContent
```

### Request Body

```json
{
  "contentType": "post",
  "contentId": "post_id",
  "reason": "Inappropriate content",
  "description": "This post contains hate speech"
}
```

### Response — `201 Created`

```json
{
  "message": "Report submitted successfully"
}
```

---

# 🛡️ Admin Endpoints

---

## 1. Get All Reports 🔒

### Endpoint

```http
GET /admin/reports
```

### Headers

```http
Authorization: Bearer <admin_token>
```

---

## 2. Verify User 🔒

### Endpoint

```http
POST /admin/verify/:userId
```

### Headers

```http
Authorization: Bearer <admin_token>
```

---
