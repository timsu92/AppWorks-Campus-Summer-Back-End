# Canchu：社交媒體平台

這個repo是一個Express+MySQL+Redis+Nginx組成的後端系統，主要功能包含使用者帳號、交友、貼文、留言、顯示貼文。

[toc]

## 資料夾結構

| 檔案 | 說明 |
| --- | --- |
| `package.json`、`package-lock.json`、`.nvmrc` | 本專案主要是一個用`npm`管理的Node 18專案。有一些「隨插即用」的腳本可以在`package.json`的`scripts`中找到 |
| `src`、`tsconfig.json` | 伺服器本身的程式碼 |
| `services` | 為了要配合此伺服器執行，需要一些額外的服務配合。這裡可以找到一些設定檔 |
| `Dockerfile` | 伺服器本身包成docker image的方法。會用到不在repo中的`env`檔 |
| `docker-compose.yml` | 在本機執行所有的服務，不需要額外再安裝套件。會用到services底下的設定，也會用到不在repo中的`env`檔 |
| `README.md` | 本說明檔 |
| `test`、`.mocharc.yaml` | 本專案使用[mocha](https://mochajs.org/)進行測試，但並沒有完成撰寫所有的測試 |
| `LICENSE`、`COPYING` | 本專案因為使用的相關套件，以GPL v3授權 |
| docs | 當初製作時的指引 |

本專案所包含的環境檔非常多，均包含在.gitignore內。以下列出他們格式：

- .env.json

    ```json
    {
      "sqlCfgOld": {
        "host": "canchu-mysql-1",
        "user": "<username of MySQL>",
        "password": "<password of MySQL>",
        "database": "canchu",
        "waitForConnections": true,
        "connectionLimit": 3
      },
      "sqlUser": {
        "username": "<username of MySQL>",
        "password": "<password of MySQL>"
      },
      "jwtAccountSecret": "<password>",
      "apiVer": "1.0",
      "frontendAddr": "canchu-for-backend.vercel.app",
      "cacheAddr": "<the address holds backend service. No 'https://' required>",
      "cacheCfg": {
        "host": "canchu-cache-1",
        "username": "<username>",
        "password": "<password>"
      },
      "RDSAddr": "<address of Amazon RDS. Not required if using local MySQL in Docker>"
    }
    ```

    因此，MySQL資料庫、redis、RDS完全是可以定義的。除此之外，還可以指定環境變數`MODE`為`local`以使用在docker中的MySQL container。

- services/redis/passwd

    ```
    REDIS_PASSWORD=*********
    ```

- services/mysql/passwd

    ```
    MYSQL_PASSWORD=********
    MYSQL_ROOT_PASSWORD=***********
    ```

- services/nginx/cert/certificate.crt 以及 services/nginx/cert/private.key

    這兩個檔案是[申請HTTPS](https://www.sslforfree.com/)會得到的檔案。

<details><summary><h2>API endpoints</h2></summary>

## User APIs

<details><summary><h3>User Sign Up APIs</h3></summary>

Refer to [User Sign Up API](#user-sign-up-api), and build this API for front-end.

Note:

I will use the following account for testing:

```
{
    "name": "user-{random 8 characters}",
    "email": "user-{random 8 characters}@test.com",
    "password": "test"
}
```

The conditions are as follows:

- All fields (name, email, password) must be entered.
- None of the fields should be empty.
- The email field must be a valid email address.
- It should not be possible to register with a duplicate email."

</details>

<details><summary><h3>User Sign In APIs</h3></summary>

Refer to [User Sign In API](#user-sign-in-api) to build this API for front-end.

</details>

<details><summary><h3>Native Email/Password Authentication</h3></summary>

In the end, you will build two method for user authentication; while we can only implement native email/password authentication mechanism just for now.

Every time user sign in successfully, you should update and response a [JSON Web Tokens](https://jwt.io/introduction) to front-end.

Note:

I will use the following account for testing:
step1: Sign up

```
{
    "name": "user-{random 8 characters}",
    "email": "user-{random 8 characters}@test.com",
    "password": "test"
}
```

step2: Sign in

```
{
    "provider": "native",
    "email": "user-{random 8 characters}@test.com",
    "password": "test"
}
```

</details>

<details><summary><h3>User Profile APIs</h3></summary>

Refer to [User Profile API](#user-profile-api), build this API for front-end. We should parse the received JWT(JSON Web Token) to make sure it's an authorized request and get user information from the token without DB query.

Note: skip `friend_count` and `friendship` first.

</details>

<details><summary><h3>Build User's Profile Update API.</h3></summary>

Refer to [User's Profile Update API](#users-profile-update-api) and implement this API on the front-end. Update the required fields in the database, ensuring that the user is logged in and that the updates are applied to the same user's data.

</details>

<details><summary><h3>Build User's Picture Update API</h3></summary>

Refer to [User's Picture Update API](#users-picture-update-api), build this API for front-end.

The front-end will send the image using the `multipart/form-data` format. The back-end needs to download the image and save it to the `static` folder, allowing the image to be accessed.

Note: Use `multer` module to handle file uploading.

</details>

<details><summary><h3>User Search APIs</h3></summary>

Refer to [User Search API](#user-search-api), build this API for front-end. To implement the User Search API, you can input a keyword and compare it against the names of users in the database. If there is a match, you need to return the corresponding data. Additionally, you will need to perform a JOIN operation with the friendship relationship table to determine the relationship between the two individuals.

Note: No pagination is required here. Pagination exercises will be covered in [later stages](#build-post-search-api) of API learning.

</details>

## Friend APIs

<details><summary><h3>Build Friends Request API</h3></summary>

Refer to [Friend Request API](#friends-request-api), build this API for front-end. Users can invite each other to become friends by using their respective user's id.

Coordinates with [notification APIs](#friendship-invitation-notification-apis). There are two scenarios where notifications will be received:

1. When sending a friend request to someone else, the recipient will receive `"XXX invited you to be friends."`
2. When the recipient accepts the friend request, the sender will receive `"XXX has accepted your friend request."`

</details>

<details><summary><h3>Build Friends Pending API</h3></summary>

Refer to [Friend Pending API](#friends-pending-api), build this API for front-end. The user who is invited to become a friend can use this API to identify who has invited them to be friends.

</details>

<details><summary><h3>Build Friends Agree API</h3></summary>

Refer to [Friend Agree API](#friends-agree-api), build this API for front-end. The user who has been invited to become a friend can agree to become friends.

</details>

<details><summary><h3>Build Delete Friend API</h3></summary>

Refer to [Delete Friend API](#delete-friend-api), build this API for front-end.

This API has two functionalities:

1. The person who invited someone to become a friend can withdraw the invitation.
2. Both parties who have become friends can delete the friendship relationship.

</details>

## Friendship invitation Notification APIs

<details><summary><h3>Build Get Events API</h3></summary>

Refer to [Get Event API](#get-events-api), build this API for front-end. Users can retrieve all their notifications, including both read and unread notifications, by making a `GET` request.

</details>

<details><summary><h3>Build Read Events API</h3></summary>

Refer to [Read Event API](#read-event-api), build this API for front-end. Users can mark unread events as read by using the event's id.

</details>

## Post APIs

<details><summary><h3>Build Post Create API</h3></summary>

Refer to [Post Create API](#post-created-api), build this API for front-end. Each user can post on their own timeline or wall.

</details>

<details><summary><h3>Build Post Update API</h3></summary>

Refer to [Post Update API](#post-updated-api), build this API for front-end. The posted content on the timeline can be edited at any time.

</details>

<details><summary><h3>Build Post Detail API</h3></summary>

Refer to [Post Detail API](#post-detail-api), build this API for front-end. By using the Post's ID, you can obtain all the information about a specific post.

</details>

<details><summary><h3>Build Post Search API</h3></summary>

Refer to [Post Search API](#post-search-api), build this API for front-end.

Users can search for other users' posts or their own timeline, and it is necessary to design a pagination mechanism for the search results.

</details>

## Post Like APIs

<details><summary><h3>Build Post Create Like API</h3></summary>

Refer to [Post Create Like API](#post-create-like-api), build this API for front-end. Each user can post on their own timeline or wall. Users can press the "Like" button for posts that they haven't liked yet.

</details>

<details><summary><h3>Build Post Delete Like API</h3></summary>

Refer to [Post Update API](#post-delete-like-api), build this API for front-end. Users can retract their "Like" from content they have already liked.

</details>

## Post Comment APIs

<details><summary><h3>Build Post Create Comment API</h3></summary>

Refer to [Post Create Comment API](#post-create-comment-api), build this API for front-end. Users can leave multiple comments on a single post.

</details>

</details>

---

<details><summary><h2>Detailed API descriptions</h2></summary>

## API Version

1.0

## Response Objects

- `User Object`

| Field | Type | Description |
| --- | --- | --- |
| id | Number | User's ID. |
| provider | String | Service provider. |
| email | String | User's email. |
| name | String | User's name. |
| picture | String | URL or path to the user's picture. |

- `User Comment Object`

| Field | Type | Description |
| --- | --- | --- |
| id | Number | User's ID. |
| name | String | User's name. |
| picture | String | URL or path to the user's picture. |

- `User Search Object`

| Field | Type | Description |
| --- | --- | --- |
| id | Number | User's ID. |
| name | String | User's name. |
| picture | String | URL or path to the user's picture. |
| friendship | Friendship Object or null | Status of the friendship. |

- `User Detail Object`

| Field | Type | Description |
| --- | --- | --- |
| id | Number | User's ID. |
| name | String | User's name. |
| picture | String | URL or path to the user's picture. |
| friend_count | Number | The number of friends. |
| introduction | String | Self-introduction. |
| tags | String | Interests & Labels. |
| friendship | Friendship Object or null | Status of the friendship. |

- `Friendship Object`

| Field | Type | Description |
| --- | --- | --- |
| id | Number | User's ID. |
| status | String | Enum(pending, requested, friend). |

- `Event Object`

| Field | Type | Description |
| --- | --- | --- |
| id | Number | Event's ID. |
| type | String | Event's type. |
| image | String | URL or path to the image associated with the event. |
| summary | String | Brief summary or description of the event. |
| is_read | Boolean | Indicates whether the item has been read or not. |
| created_at | String | Date and time when the event was created. |

- `Post Detail Object`

| Field | Type | Description |
| --- | --- | --- |
| id | Number | Post's ID. |
| user_id | Number | User's ID. |
| created_at | String | Date and time when the post was created. |
| context | String | Content or context of the post. |
| summary | String | Brief summary or description of the event. |
| is_liked | Boolean | Indicates whether the post is liked or not. |
| like_count | Number | The count of likes received by the post. |
| comment_count | Number | The count of comments on the post. |
| picture | String | URL or path to the user's profile picture. |
| name | String | The name of the user who created the post. |
| comments | Array | Array of Comment Object. |

- `Post Search Object`

| Field | Type | Description |
| --- | --- | --- |
| id | Number | Post's ID. |
| created_at | String | Date and time when the post was created. |
| context | String | Content or context of the post. |
| is_liked | Boolean | Indicates whether the post is liked or not. |
| like_count | Number | The count of likes received by the post. |
| comment_count | Number | The count of comments on the post. |
| picture | String | URL or path to the user's profile picture. |
| name | String | The name of the user who created the post. |

- `Comment Object`

| Field | Type | Description |
| --- | --- | --- |
| id | Number | Comment's ID. |
| created_at | String | Date and time when the comment was created. |
| content | String | Content of the comment. |
| user | Object | User Comment Object |

---

## Users

### User Sign Up API

- **End Point:** `/users/signup`
- **Method:** `POST`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Content-Type | String | Only accept application/json. |
- **Request Body**

| Field | Type | Description |
| --- | --- | --- |
| name | String | Required |
| email | String | Required |
| password | String | Required |
- **Request Body Example:**

```
{
  "name":"test",
  "email":"test@test.com",
  "password":"test"
}

```

- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| access_token | String | Access token from server. |
| user | User Object | User information |
- **Success Response Example:**

```
{
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6joiYXJ0aHVIjoxNjEzNTY3MzA0fQ.6EPCOfBGynidAfpVqlvbHGWHCJ5LZLtKvPaQ",
    "user": {
      "id": 11245642,
      "provider": "facebook",
      "name": "Pei",
      "email": "pei@appworks.tw",
      "picture": "<https://schoolvoyage.ga/images/123498.png>"
    }
  }
}

```

- **Email Already Exists: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### User Sign In API

- **End Point:** `/users/signin`
- **Method:** `POST`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Content-Type | String | Only accept application/json. |
- **Request Body**

| Field | Type | Description |
| --- | --- | --- |
| provider | String | Only accept native or facebook |
| email | String | Required if provider set to native |
| password | String | Required if provider set to native |
| access_token | String | Access token from facebook. Required if provider set to facebook |
- **Request Body Example:**

```
{
  "provider":"native",
  "email":"test@test.com",
  "password":"test"
}
```

or

```
{
  "provider":"facebook",
  "access_token": "EAACEdEose0cBAHc6hv9kK8bMNs4XTrT0kVC1RgDZCVBptXW12AI"
}
```

- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| access_token | String | Access token from server. |
| user | User Object | User information |
- **Success Response Example:**

```
{
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6joiYXJ0aHVIjoxNjEzNTY3MzA0fQ.6EPCOfBGynidAfpVqlvbHGWHCJ5LZLtKvPaQ",
    "user": {
      "id": 11245642,
      "provider": "facebook",
      "name": "Pei",
      "email": "pei@appworks.tw",
      "picture": "<https://schoolvoyage.ga/images/123498.png>"
    }
  }
}

```

- **Sign In Failed (Wrong Password, User Not Found, Wrong provider): 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### User Profile API

> Authorization
> 
- **End Point:** `/users/:id/profile`
- **Method:** `GET`
- **Parameters**

| Field | Type | Description |
| --- | --- | --- |
| id | Number | User's id |
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Request Example:**
    
    `http://[HOST_NAME]/api/[API_VERSION]/users/1/profile`
    
    `http://[HOST_NAME]/api/[API_VERSION]/users/2/profile`
    
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| user | User Detail Object | User info. |
- **Success Response Example:**

```
{
  "data": {
    "user": {
      "id": 10,
      "name": "Pei",
      "picture": "<https://schoolvoyage.ga/images/123498.png>",
      "friend_count": 1,
      "introduction": "我畢業於台灣大學，喜歡到處旅行。",
      "tags": "台灣大學,打棒球,旅遊",
      "friendship": {
        "id": 1,
        "status": "requested"
      }
    }
  }
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### User's Picture Update API

> Authorization
> 
- **End Point:** `/users/picture`
- **Method:** `PUT`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
| Content-Type | String | Only accept multipart/form-data. |
- **Request Body**

| Field | Type | Description |
| --- | --- | --- |
| picture | File | Image File. |
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| picture | String | Image link. |
- **Success Response Example:**

```
{
  "data": {
    "picture": "<https://schoolvoyage.ga/images/123498.png>"
  }
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### User's Profile Update API

> Authorization
> 
- **End Point:** `/users/profile`
- **Method:** `PUT`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
| Content-Type | String | Only accept application/json. |
- **Request Body**

| Field | Type | Description |
| --- | --- | --- |
| name | String | User's name. |
| introduction | String | Self-introduction. |
| tags | String | Interests & Labels. |
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| user.id | Number | User's id. |
- **Success Response Example:**

```
{
  "data": {
    "user": {
      "id": 1
    }
  }
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### User Search API

> Authorization
> 
- **End Point:** `/users/search`
- **Method:** `GET`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Query Parameters**

| Field | Type | Description |
| --- | --- | --- |
| keyword | String | Required |
- **Request Example:**
    
    `http://[HOST_NAME]/api/[API_VERSION]/users/search?keyword=PJ`
    
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| users | Array | Array of User Search Object. |
- **Success Response Example:**

```
"data": {
  "users": [{
    "id": 1,
    "name": "PJ",
    "picture": "<https://schoolvoyage.ga/images/123498.png>",
    "friendship": null
  }, {
    "id": 24,
    "name": "PJ2",
    "picture": "<https://schoolvoyage.ga/images/123499.png>",
    "friendship": {
      "id": 2,
      "status": "requested"
    }
  }]
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

## Friends

### Friends API

> Authorization
> 
- **End Point:** `/friends/`
- **Method:** `GET`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Request Example:**
    
    `http://[HOST_NAME]/api/[API_VERSION]/friends/`
    
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| users | Array | Array of User Search Object. |
- **Success Response Example:**

```
"data": {
  "users": [{
    "id": 1,
    "name": "PJ",
    "picture": "<https://schoolvoyage.ga/images/123498.png>",
    "friendship": {
       "id": 32,
       "status": "friend"
    }
  }, {
    "id": 24,
    "name": "PJ2",
    "picture": "<https://schoolvoyage.ga/images/123499.png>",
    "friendship": {
      "id": 2,
      "status": "friend"
    }
  }]
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Friends Pending API

> Authorization
> 
- **End Point:** `/friends/pending`
- **Method:** `GET`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Request Example:**
    
    `http://[HOST_NAME]/api/[API_VERSION]/friends/pending`
    
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| users | Array | Array of User Search Object. |
- **Success Response Example:**

```
"data": {
  "users": [{
    "id": 1,
    "name": "PJ",
    "picture": "<https://schoolvoyage.ga/images/123498.png>",
    "friendship": {
      "id": 1,
      "status": "pending"
    }
  }, {
    "id": 24,
    "name": "PJ2",
    "picture": "<https://schoolvoyage.ga/images/123499.png>",
    "friendship": {
      "id": 2,
      "status": "pending"
    }
  }]
}

```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Friends Request API

> Authorization
> 
- **End Point:** `/friends/:user_id/request`
- **Method:** `POST`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Parameters**

| Field | Type | Description |
| --- | --- | --- |
| user_id | Number | User's id |
- **Request Example:**
    
    `http://[HOST_NAME]/api/[API_VERSION]/friends/1/request`
    
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| friendship | Object | Friendship Object. |
- **Success Response Example:**

```
"data": {
  "friendship": {
    "id": 1
  }
}

```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Friends Agree API

> Authorization
> 
- **End Point:** `/friends/:friendship_id/agree`
- **Method:** `POST`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Parameters**

| Field | Type | Description |
| --- | --- | --- |
| friendship_id | Number | Friendship's id |
- **Request Example:**
    
    `http://[HOST_NAME]/api/[API_VERSION]/friends/1/agree`
    
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| friendship | Object | Friendship Object. |
- **Success Response Example:**

```
"data": {
  "friendship": {
    "id": 1
  }
}

```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Delete Friend API

> Authorization
> 
- **End Point:** `/friends/:friendship_id`
- **Method:** `DELETE`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Parameters**

| Field | Type | Description |
| --- | --- | --- |
| friendship_id | Number | Friendship's id |
- **Request Example:**
    
    `http://[HOST_NAME]/api/[API_VERSION]/friends/1`
    
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| friendship | Object | Friendship Object. |
- **Success Response Example:**

```
"data": {
  "friendship": {
    "id": 1
  }
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

## Events

### Get Events API

> Authorization
> 
- **End Point:** `/events/`
- **Method:** `GET`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Request Example:**
    
    `http://[HOST_NAME]/api/[API_VERSION]/events/`
    
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| events | Array | Array of Event Object. |
- **Success Response Example:**

```
"data": {
  "events": [{
    "id": 1,
    "type": "friend_request",
    "is_read": false,
    "image": "<https://schoolvoyage.ga/images/123498.png>",
    "created_at": "2023-03-23 23:10:21",
    "summary": "王小明邀請你成為好友"
  }, {
    "id": 2,
    "type": "friend_request",
    "is_read": true,
    "image": "<https://schoolvoyage.ga/images/123498.png>",
    "created_at": "2023-03-23 23:10:21",
    "summary": "王小明邀請你成為好友"
  }]
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Read Event API

> Authorization
> 
- **End Point:** `/events/:event_id/read`
- **Method:** `POST`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Parameters**

| Field | Type | Description |
| --- | --- | --- |
| event_id | Number | Event's id |
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| event | Object | Event Object. |
- **Success Response Example:**

```
{
  "data": {
    "event": {
      "id": 1
    }
  }
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

## Posts

### Post Created API

> Authorization
> 
- **End Point:** `/posts/`
- **Method:** `POST`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Content-Type | String | Only accept application/json. |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Request Body**

| Field | Type | Description |
| --- | --- | --- |
| context | String | The context or content of the post. |
- **Request Body Example:**

```
{
  "context": "今天在口袋裡撿到兩百元，好開心！"
}
```

- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| post | Object | Object of post. |
- **Success Response Example:**

```
{
  "data": {
    "post": {
      "id": 1
    }
  }
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Post Updated API

> Authorization
> 
- **End Point:** `/posts/:id`
- **Method:** `PUT`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
| Content-Type | String | Only accept application/json. |
- **Parameters**

| Field | Type | Description |
| --- | --- | --- |
| id | Number | Post's id |
- **Request Body**

| Field | Type | Description |
| --- | --- | --- |
| context | String | The context or content of the post. |
- **Request Body Example:**

```
{
  "context": "不發廢文了！"
}
```

- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| post | Object | Object of post. |
- **Success Response Example:**

```
{
  "data": {
    "post": {
      "id": 1
    }
  }
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Post Detail API

> Authorization
> 
- **End Point:** `/posts/:id`
- **Method:** `GET`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Request Example:**
    
    `http://[HOST_NAME]/api/[API_VERSION]/posts/1`
    
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| post | Object | Post Detail Object. |
- **Success Response Example:**

```
"data": {
  "post": {
    "id": 1,
    "user_id": 1,
    "created_at": "2023-04-09 22:21:48",
    "context": "動態動態動態動態動態動態動態動態",
    "is_liked": true,
    "like_count": 327,
    "comment_count": 68,
    "picture": "<https://i.imgur.com/VTC742A.png>",
    "name": "PJ",
    "comments": [{
      "id": 1,
      "created_at": "2023-04-10 23:21:10",
      "content": "評論評論評論評論評論評論",
      "user": {
        "id": "1",
        "name": "PJ",
        "picture": ""
      }
    }]
  }
}
```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Post Search API

> Authorization
> 
- **End Point:** `/posts/search`
- **Method:** `GET`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Query Parameters**

| Field | Type | Description |
| --- | --- | --- |
| user_id (Optional) | Number | User's id. |
| cursor (Optional) | String | Next page key. |
- **Request Example:**
    - `http://[HOST_NAME]/api/[API_VERSION]/posts/searchhttp://[HOST_NAME]/api/[API_VERSION]/posts/search?user_id=1`
    - `http://[HOST_NAME]/api/[API_VERSION]/posts/search?cursor='KHEAX0GAFjlPyyqAqTcQOXTLKgIVvshji9AqRmuAGjCDESoLlUrrIn7P'http://[HOST_NAME]/api/[API_VERSION]/posts/search?user_id=1&cursor='KHEAX0GAFjlPyyqAqTcQOXTLKgIVvshji9AqRmuAGjCDESoLlUrrIn7P'`
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| posts | Array | Array of Post Search Object. |
| next_cursor | String or Null | Next page key. |
- **Success Response Example:**

```
"data": {
  "posts": [{
    "id": 1,
    "user_id": 1,
    "created_at": "2023-04-09 22:21:48",
    "context": "動態動態動態動態動態動態動態動態",
    "is_liked": true,
    "like_count": 327,
    "comment_count": 68,
    "picture": "<https://imgur.com/XXXXX>",
    "name": "PJ"
  }],
  "next_cursor": "KHEAX0GAFjlPyyqAqTcQOXTLKgIVvshji9AqRmuAGjCDESoLlUrrIn7P"
}

```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Post Create Like API

> Authorization
> 
- **End Point:** `/posts/:id/like`
- **Method:** `POST`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Parameter**

| Field | Type | Description |
| --- | --- | --- |
| id | String | Post's id |
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| post | Object | Post's id in Object |
- **Success Response Example:**

```
{
  "data": {
    "post": {
      "id": 1
    }
  }
}

```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Post Delete Like API

> Authorization
> 
- **End Point:** `/posts/:id/like`
- **Method:** `DELETE`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Parameter**

| Field | Type | Description |
| --- | --- | --- |
| id | String | Post's id |
- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| post | Object | Post's id in Object |
- **Success Response Example:**

```
{
  "data": {
    "post": {
      "id": 1
    }
  }
}

```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

### Post Create Comment API

> Authorization
> 
- **End Point:** `/posts/:id/comment`
- **Method:** `POST`
- **Request Headers:**

| Field | Type | Description |
| --- | --- | --- |
| Content-Type | String | Only accept application/json. |
| Authorization | String | Access token preceding Bearer . For example: Bearer x48aDD534da8ADSD1XC4SD5S |
- **Parameter**

| Field | Type | Description |
| --- | --- | --- |
| id | String | Post's id |
- **Request Body**

| Field | Type | Description |
| --- | --- | --- |
| content | String | The context or content of the comment. |
- **Request Body Example:**

```
{
  "content": "今天在口袋裡撿到兩百元，好開心！"
}

```

- **Success Response: 200**

| Field | Type | Description |
| --- | --- | --- |
| post | Object | Post's id in Object |
| comment | Object | Comment's id in Object |
- **Success Response Example:**

```
{
  "data": {
    "post": {
      "id": 1
    },
    "comment": {
      "id": 1
    }
  }
}

```

- **Client Error (No token) Response: 401**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error (Wrong token) Response: 403**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Client Error Response: 400**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |
- **Server Error Response: 500**

| Field | Type | Description |
| --- | --- | --- |
| error | String | Error message. |

---

</details>
