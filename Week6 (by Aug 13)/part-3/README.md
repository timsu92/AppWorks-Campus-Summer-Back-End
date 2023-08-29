# Week 6 part 3

# Crawler + Scheduler

In this task, we need to scrape content from a news website and automate the posting process. Therefore, we need to build two main functionalities: web scraping and an automated workflow.

Try using tools like fetch or puppeteer to scrape the content of a news website (any one of your choice). Once new content is available, it should trigger a POST request to /api/1.0/posts to create a new post.

Note: You can check for new news every 30 minutes. If new content is found, it should initiate the above automated workflow.

## Assignment Submission Method:
Please address the following questions:

1. How did you configure the automation to run every 30 minutes?
2. Did you implement any special handling?

## Advanced:
1. How did you utilize workflow automation tools like Airflow to accomplish this task?


## Discussion
1. How did you implement web scraping to extract content from the news website?
2. How did you set up the automation to run every 30 minutes?
3. What special handling, if any, did you implement in your solution?
