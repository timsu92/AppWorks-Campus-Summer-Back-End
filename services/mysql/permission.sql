GRANT SELECT, DELETE, UPDATE, INSERT ON canchu.* TO 'dev'@'%';
CREATE DATABASE canchuTest;
USE canchuTest;
CREATE TABLE canchuTest.chat_message LIKE canchu.chat_message;
CREATE TABLE canchuTest.event LIKE canchu.event;
CREATE TABLE canchuTest.friendship LIKE canchu.friendship;
CREATE TABLE canchuTest.`group` LIKE canchu.`group`;
CREATE TABLE canchuTest.group_post LIKE canchu.group_post;
CREATE TABLE canchuTest.post LIKE canchu.post;
CREATE TABLE canchuTest.post_comment LIKE canchu.post_comment;
CREATE TABLE canchuTest.post_likes LIKE canchu.post_likes;
CREATE TABLE canchuTest.`user` LIKE canchu.`user`;
CREATE TABLE canchuTest.user_group LIKE canchu.user_group;
GRANT SELECT, DELETE, UPDATE, INSERT ON canchuTest.* TO 'dev'@'%';
USE canchu;
