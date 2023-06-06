# Week 1 Part 3

## Build User APIs

It's time to build member system for our website.

### Build User Sign Up APIs

Refer to [User Sign Up API](https://github.com/AppWorks-School-Materials/API-Doc/tree/master/Stylish#user-sign-up-api), and build this API for front-end.

### Build User Sign In APIs

Refer to [User Sign In API](https://github.com/AppWorks-School-Materials/API-Doc/tree/master/Stylish#user-sign-in-api) to build this API for front-end.

#### Native Email/Password Authentication

In the end, you will build two method for user authentication; while we can only implement native email/password authentication mechanism just for now.

Every time user sign in successfully, you should update and response a [JSON Web Tokens](https://jwt.io/introduction) to front-end.

### Build User Profile APIs

Refer to [User Profile API](https://github.com/AppWorks-School-Materials/API-Doc/tree/master/Stylish#user-profile-api), build this API for front-end. We should parse the received JWT(JSON Web Token) to make sure it's an authorized request and get user information from the token without DB query.

### Note:

1. You should make sure that each email address can only be signed up once. You should not have two users with the same email address in your database.

2. You should insert **hashed password** to your database when users sign up a new account. Never store password in **plain text** in database for security concern.

3. If you have added any special rules for the account name, email or password, please make sure the account below can pass your rules for sign up. I will use it to test your functionality.

```
{
    "name": "stylishtest",
    "email": "stylishtest_<random generated 8 characters string>@test.com",
    "password": "stylishtest1234"
}
```