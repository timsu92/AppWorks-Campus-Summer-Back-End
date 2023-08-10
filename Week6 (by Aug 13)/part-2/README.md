# Week 6 Part 2

## Message Queue / Job Queue / Work Queue

Our application may have some tasks, such as sending email, processing images/videos, rebuilding search indexes and processing large data sets, that take too long to perform during a typical web request.

We can build `message queue` to provide a better user experience to your clients. By moving time intensive tasks to a queue, our application can respond to web requests with blazing speed.

The basic architecture of a message queue is simple. Input services, called producers/publishers, create messages (or jobs), and publish them to a message queue. Other services, called consumers/subscribers, connect to the queue, and perform actions defined by the messages.

![image](<https://github.com/AppWorks-School-Materials/Campus-Summer-Back-End/blob/advance/Week-6%20(by%20Aug%2013)/part-2/message-queue.png>)

### Generate fake posts data:

Follow your own design of posts table and insert 1000 ~ 5000 records with random user_id and total column.

- Your total value may be inside of a JSON object or in other table, just follow your original design and create orders with this number.
- If you don't have user_id column, just add one.
- Since you may want to test with different volumn of data, try to write a script which can let you create and truncate data easily.

- Posts data detail:
  - context: random text (10 words ~ 100 words)
  - user_id: random integer
  - created_at: random datetime

note: create 1000 ~ 5000 records

### Implement the API without queue

1. Create new API: https://[HOST_NAME]/api/1.0/report/posts

2. Load Data from DB directly (**Do not use SUM or GROUP BY command, just run a simple query like SELECT user_id, context FROM posts;**)

3. Aggregate the data by Node.js code, you need to sum up the word count of each post.

Success Response Example:

```
{
  "data": [
      {
          user_id: 1
          total_words: 6380
      },
      {
          user_id: 2
          total_words: 1250
      },
      ...
  ]
}
```

### Implement the API by Queue

In your web server:

1. Create new API: https://[HOST_NAME]/api/2.0/report/posts
2. Publish a data processing job into the message queue.
3. Respond to client that the job was successfully submitted.

In job worker:

Data processing worker pick up jobs from the message queue and asynchronously perform the data aggregation job.

Hit: You can implement job queue with Redis, which type in Redis is suitable for job queue?

## Advanced Optional

1. How to notify your client that job is done?
2. How to deal with failed jobs?
3. How to use RabbitMQ instead of redis?

## Discussion
1. What is the purpose and benefit of using a message queue in a web application?
2. How can you implement the API without using a message queue, and what are the potential drawbacks?
3. How do you implement the API using a message queue, and what technology is suitable for building the queue?