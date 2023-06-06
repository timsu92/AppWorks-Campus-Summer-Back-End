# Week 0 Part 2

## Introduction to Amazon Web Service (AWS)

Amazon Web Service (AWS) is the most popular cloud service in the world. Today we should use AWS as infrastructure for web server.

### Create Account on AWS

Go to [AWS official website](https://aws.amazon.com/). Create your account on AWS.

**Please enable MFA for security**

### Create Instance on Amazon Elastic Compute Cloud (Amazon EC2)

Create an instance on Amazon EC2 which should meet following requirements:

1. Instance type should be **t3.micro** or **t2.micro**.
2. Machine image should be **Ubuntu Server 20.04** or **Ubuntu Server 22.04**.
3. Attach **8GB General Purpose SSD** storage at least.

### Associate Elastic IP with Instance

Find the **Elastic IPs** service in Amazon EC2. Create a public IP and associate it with your instance.

### Connect and Manage Instance

Find a way to connect to your Amazon EC2 instance and manage it by command line interface.

### Install Node.js

Find a way to install Node.js on your instance.

### Build Node.js Project for Web Server

Build your first Node.js project for web server on your instance. Just as before, you should use **Express.js** as a solution, but binding to **80 port**. Finally, we can check your website by entering URL `http://[YOUR_PUBLIC_ELASTIC_IP]/` in the browser's address bar.

**Write down your website URL in README.md file.**
**Write down how to start your web server on port 80 in README.md file.**

### Build Working Flow

Every time you hand in assignment, I will check your **GitHub repository** and **website URL**. So, build a working flow between your local machine and cloud environment, which can be supported by **Git** and **GitHub**.

---

## Learn how to edit file on Linux environment

If you want to edit a file in your Cloud Instance (EC2), you should learn how to use the pure text editor like "vim" or "emacs". You only need to choice one of them and learn the very basic commands like move cursor, insert text and save file. You will find out these basic skills very useful in the future.

---

## Run Web Server in the Background

You should keep web server alive even if you close connection from your instance or do other tasks at the same time.  
Find a way to run web server in the background and **write down your solution in README.md file.**

---

## MySQL Database Server

We will use MySQL as database solution. Today, let's install and run MySQL on your instance.

### Install and Run MySQL Server

Find a way to install and run MySQL on your instance. Version 8.x is recommended.

### Manage MySQL from Command Line Interface

Connect to MySQL server from command line interface on your instance. Create a database named **stylish** and create a **product** table which includes columns listed below.

| Field |      Type       | Null | Key     | Extra          |
| :---: | :-------------: | :--- | :------ | :------------- |
|  id   | bigint unsigned | no   | primary | auto_increment |
| title |  varchar(255)   | no   |         |                |

From now on, **always keep a SQL database file in your project** exported by mysqldump tool.