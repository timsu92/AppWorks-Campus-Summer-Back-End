# Week 0 Part 1

## Learn Git and GitHub

- [GitHub Training & Guides](https://www.youtube.com/watch?v=FyfwLX4HAxM&list=PLg7s6cbtAD15G8lNyoaYDuKZSKyJrgwB-&index=1) (Video)
- [Try git](https://try.github.io)
- [GitHub Guides](https://guides.github.com)

## Markdown

- [Markdown Guide](https://www.markdownguide.org/getting-started/)
- [Markdown Tutorial](https://www.markdowntutorial.com/)
- [Markdown Live Preview](https://markdownlivepreview.com/)

## Before assignment

From now on, we're going to start the project `Canchu`.

1. Fork this repository in AppWorks School account to your GitHub account.
2. You will get a `forked repository` in your GitHub account.
3. We call this repository in AppWorks School `upstream repository`.
4. Clone your `forked repository` from GitHub to your local machine.
5. Create a `develop` branch from `main` branch in your local machine.
6. Change your current branch from `main` to `develop` in your local machine.

## Assignment

Every time before you start a new assignment, please create a new **assignment branch** from the **develop** branch with the following rules and complete the assignment on that branch.

```
Assignment branch naming rules:

  week_(week number)_part_(part number)

Ex: For week 1 part 3

  => week_1_part_3
```

1. Find a subfolder named **Canchu** under the **students/[your_name]** folder.
2. Create and modify **README.md** file, write down **your name** in this file and practice more markdown language.
3. Make your first commit for the changes using git.
4. Push **current assignment branch** to `your forked repository`.

## How to hand-in?

Please find the **assignment branch** on your `forked repository` and make a pull request from this branch to `[your_name]_develop` of the `upstream repository`. (Please never make a pull request to the main branch of the `upstream repository`)

You should check your email for tracking the status of pull request. If your pull request is not accepted by repository host, it means that the assignment have issues should be fix. I will mention the issues in the comment.

Please fix the issues and push new commits to the same assignment branch. The pull request will automatically update itself, so you don't have to create another pull request for the same assignment.

### About Pull Request

- Leave the title unchanged.
- Always include **your online URL**, **short description of what you have done** and **test plan** in the description of pull request.

### Sync Develop Branch

- If your pull request is merged, you should update local `develop` branch by pulling from remote `[your_name]-develop` branch.

### Sample PR

![github com_AppWorks-School_Front-End-Class-Batch16_pull_121 (4)](https://user-images.githubusercontent.com/11663276/173797630-58573dba-d62b-40ea-905e-ea3331e96f59.png)



## Discussion
----
1. What is git flow?
2. What is the purpose of git branch?
3. How to have a good commit message?