# 蘇胤翔

## Week0 part-1：markdown練習

### 這是第三大的標題

#### 這是第四大的標題

##### 這是第五大的標題

###### 這是第六大的標題

---

**粗體字**、*斜體字*、***粗斜體***、~~刪除線~~

### 實用連結

* [簡單的markdown學習資源](https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs)
* [沈老師的學習筆記][learning material]

<details><summary>更多私房內容</summary>

好啦！其實依然沒有🤣給你兩隻安慰貓貓
![安慰貓貓](https://www.maoup.com.tw/wp-content/uploads/2015/06/9010546448_f0ec3cb448_z.jpg)
![安慰貓貓][cat]
</details>

[learning material]: https://www.popdaily.com.tw/shaper/u/202201/db0195a3-1812-49ba-9e86-06b5ebce5e53.jpg?resize-w=900&resize-h=468
[cat]: https://cdn.pixabay.com/photo/2016/03/27/07/31/cat-1282309_1280.jpg

### 引用

> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod     tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At     vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,     no sea takimata sanctus est Lorem ipsum dolor sit amet.

### 換行

> 硬換行
>
> 硬換行

> 軟換行  
> 軟換行

## Week0 part-2：開AWS EC2機器

網站位置：[從Assignment-4改過來的express](http://54.84.102.233/)

### 啟動方法

1. 依照[stack overflow的方法](https://stackoverflow.com/questions/5004159/opening-port-80-ec2-amazon-web-services)修改EC2的網路安全性設定
1. Git clone [remote-assignments](https://github.com/timsu92/remote-assignments)
2. cd到Week-1/Assignment-4
3. `npm i`
4. 修改`index.ts`的`port`
5. `npx tsc`
6. `sudo /home/ubuntu/.nvm/versions/node/v18.16.1/bin/node dist/index.js&`  
   `&`是為了讓程式在背景執行，即使把ssh連線斷掉也行
