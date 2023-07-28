# Canchu

[伺服器位置](https://54.84.102.233/)

## 啟動方法

1. 依照[stack overflow的方法](https://stackoverflow.com/questions/5004159/opening-port-80-ec2-amazon-web-services)修改EC2的網路安全性設定
1. Git clone [remote-assignments](https://github.com/timsu92/remote-assignments)
2. cd到程式碼的位置
3. `npm i`
4. 修改`index.ts`的`port`
5. `npx tsc`
6. `sudo /home/ubuntu/.nvm/versions/node/v18.16.1/bin/node dist/index.js&`  
   `&`是為了讓程式在背景執行，即使把ssh連線斷掉也行

[伺服器位置](https://54.84.102.233/)
