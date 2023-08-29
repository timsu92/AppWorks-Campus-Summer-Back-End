# Week 2 Part 3

## Build Event's API

### Modify Friend Request API
There are two scenarios where notifications will be received:

1. When sending a friend request to someone else, the recipient will receive `"XXX invited you to be friends."`
2. When the recipient accepts the friend request, the sender will receive `"XXX has accepted your friend request."`


### Build Get Events API
Refer to [Get Event API](https://github.com/AppWorks-School-Materials/API-Doc/tree/master/Canchu#get-events-api), build this API for front-end. Users can retrieve all their notifications, including both read and unread notifications, by making a `GET` request.


### Build Read Events API
Refer to [Read Event API](https://github.com/AppWorks-School-Materials/API-Doc/tree/master/Canchu#read-event-api), build this API for front-end. Users can mark unread events as read by using the event's id.


## Discussion
----
1. How would you maintain an existing legacy codebase?
2. How should the methods of RESTful be used? How should endpoints be named?
3. What is the N+1 query problem in a database?