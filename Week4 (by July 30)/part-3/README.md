# Week 4 Part 3

## Rate limiter

Sometimes, there will be malicious users who attack (or crawl) our website by firing thousands of requests within a short time window and crash your server.

We can build a `rate limiter` to prevent this kind of attacks. The basic idea is tracking the `ip` of each requests and only allow each ip address to request our website `N` times within `M` seconds. How to choose N, M properly is a hard question, but let's set them to be `N=10` and `M=1` for practice today.

You can set smaller `N` for manual testing.

You also need to think a reasonable way to test your rate limiter.


## Discussion
---- 
1. Please explain the different approaches for rate limiting.
2. What if the malicious user change his/her ip address all the time?