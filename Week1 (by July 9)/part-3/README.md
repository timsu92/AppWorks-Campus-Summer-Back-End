# Week 1 Part 3

## Build User APIs

### Build User Profile APIs

Refer to [User Profile API](https://github.com/AppWorks-School-Materials/API-Doc/tree/master/Canchu#user-profile-api), build this API for front-end. We should parse the received JWT(JSON Web Token) to make sure it's an authorized request and get user information from the token without DB query.


### Build User's Profile Update API.

Refer to [User's Profile Update API](https://github.com/AppWorks-School-Materials/API-Doc/tree/master/Stylish#user-profile-api) and implement this API on the front-end. Update the required fields in the database, ensuring that the user is logged in and that the updates are applied to the same user's data.


### Build User's Picture Update API

Refer to [User's Picture Update API](https://github.com/AppWorks-School-Materials/API-Doc/tree/master/Canchu#users-picture-update-api), build this API for front-end. 

The front-end will send the image using the `multipart/form-data` format. The back-end needs to download the image and save it to the `static` folder, allowing the image to be accessed.

Note: Use `multer` module to handle file uploading. 