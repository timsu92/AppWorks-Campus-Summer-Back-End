# Canchu

[![Canchu CI](https://github.com/timsu92/Campus-Summer-Back-End/actions/workflows/main.yml/badge.svg)](https://github.com/timsu92/Campus-Summer-Back-End/actions/workflows/main.yml)

## Week0 part-2：開AWS EC2機器

[網站位置](http://44.217.7.202/)

### 本機啟動方法，但會遺失相關服務而失敗

1. 依照[stack overflow的方法](https://stackoverflow.com/questions/5004159/opening-port-80-ec2-amazon-web-services)修改EC2的網路安全性設定
1. Git clone [remote-assignments](https://github.com/timsu92/remote-assignments)
2. cd到Week-1/Assignment-4
3. `npm i`
4. 修改`index.ts`的`port`
5. `npx tsc`
6. `sudo /home/ubuntu/.nvm/versions/node/v18.16.1/bin/node dist/index.js&`  
   `&`是為了讓程式在背景執行，即使把ssh連線斷掉也行
