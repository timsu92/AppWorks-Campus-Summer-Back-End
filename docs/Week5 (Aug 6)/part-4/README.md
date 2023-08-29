# Week 5 Part 4

# Task : Scale out your web server

## Task 1: Create your instance image

Congrats, now you have a stateless server and you can scale your web server without caring about state.

1. Create an AMI from an Amazon EC2 instance
2. Launch a new EC2 instance from your AMI
3. Configure your DNS settings to point to the new IP address

Note: Before creating an AMI, you may need to do some setup to automatically restart your nginx and web server after launching the instance.

Checkpoint: The website in this new instance has the same data as the original website.

## Task 2: AWS Load Balancer

1. Launch another instance with AMI you created in task 1.
2. Create `Application Load Balancer`, and register the above two EC2 instances.
3. Update your DNS for this Load Balancer.
4. Run the load testing again. Use the data generator to generate more posts incrementally (e.g. 1000 more posts at a time), and observe when the `mid` of `http_req_duration` exceeds 1 second.

## Discussion
1. Why is creating an AMI and launching new EC2 instances essential for scaling a web server?
2. What is the role of an AWS Load Balancer in scaling web applications?
3. How can load testing help in determining the appropriate scale for your web server?