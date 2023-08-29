# Week 4 Part 2

## Build Cache Mechanism

Using a cache mechanism to store frequently accessed and relatively static API data can significantly reduce database retrieval time.


## Cache User's Profile

Cache mechanism is very suitable for rarely updating data. For example, our **User's Profile** always response the same data to the front-end. If we store data in the web server memory, we can get it directly rather than database.

Follow the logics below to build a cache mechanism:

1. Every time we need user's profile data, check cache first.
2. If data existed in the cache, get it.
3. If there is no data in the cache, get it from database and store in the cache.
4. If data is updated from database, clear cache.

## Cache User's Post Data

Similar procedure described above, we can add cache mechanism for **Post Search API** to cache user's post. Alternatively, you can find other APIs suitable for using the caching mechanism, welcome to discuss with your mentor.


## Discussion
----
- Try to understand Cache mechanism in general.
- Cache in different places (e.g. front-end, back-end, CPU, ...)
- Different caching patterns
- Figure out why Redis can improve the performance. What's the difference between Memory and Disk.