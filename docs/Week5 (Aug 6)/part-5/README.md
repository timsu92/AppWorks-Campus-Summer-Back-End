# Week 5 Part 5

# Scale out your web server

## Task: Auto Scaling

1. Create `Launch Configurations` with your AMI
2. Create `Auto Scaling Groups` with the above launch configurations
   i. Attach to the ALB created in Week 5 part 4
   ii. Set the following configuration:
   - Desired capacity: 1
   - Minimum capacity: 1
   - Maximum capacity: 3 (Depends on 你有多財富自由... )
     iii. Configure Scaling policies
   - Average CPU utilization: 50
3. Attach your server, and observe the auto scaling group.
4. Run the load testing again. Use the data generator to generate more posts incrementally (e.g. posts more posts at a time), and observe when the `mid` of `http_req_duration` exceeds 1 second.

Note: You will need your colleagues to assist you in this test, so that there is enough stress to force your host to scale-out.

## Discussion
1. What is the purpose of auto scaling in web server management, and why is it essential for high-traffic websites?
2. What are the steps involved in setting up auto scaling for a web server using Launch Configurations and Auto Scaling Groups?
3. How can load testing be used to evaluate the effectiveness of the auto scaling setup, and what performance metrics should be monitored during the test?