# Week 5 Part 2

### Continuous Integration / Continuous Delivery

CI/CD is a way of developing software in which you’re able to release updates at any time in a sustainable way. When changing code is routine, development cycles are more frequent, meaningful and faster. In this part, we have to deploy our service automatically.

#### Set up The GitHub Actions workflow

Trigger on: merge or push your new code to Github on **main** branch

Set up the GitHub Actions workflow, and the success flow will be:

1. Push your new code to Github on main branch
2. Push your docker to dockerhub.
3. Pull your docker from dockerhub on your EC2 machine and run it.

Ideally, we would run automated tests and deploy them first to the test environment before deploying to the production environment.  
For now, we can test on our local machines, but it's important to be aware of any differences between the local machine and the VM.


## Disucssion
1. What is CI/CD, and how does it help development teams be more efficient in software development and deployment?
2. GitHub Actions: What are they, and how to set up workflows to achieve CI/CD?
3. Why is including a testing environment important in the CI/CD process, and how should we incorporate testing into the CI/CD process?