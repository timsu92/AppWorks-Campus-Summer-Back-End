# Week 1 Part 1

## Build User APIs

It's time to build member system for our website.

### Build User Sign Up APIs

Refer to [User Sign Up API](https://github.com/AppWorks-School-Materials/API-Doc/tree/master/Canchu#user-sign-up-api), and build this API for front-end.


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