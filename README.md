# Canchu：社交媒體平台

這個repo是一個Express+MySQL+Redis+Nginx組成的後端系統，主要功能包含使用者帳號、交友、貼文、留言、顯示貼文。

<!--ts-->
   * [資料夾結構](#資料夾結構)
<!--te-->

## 資料夾結構

| 檔案 | 說明 |
| --- | --- |
| `package.json`、`package-lock.json`、`.nvmrc` | 本專案主要是一個用`npm`管理的Node 18專案。有一些「隨插即用」的腳本可以在`package.json`的`scripts`中找到 |
| `src`、`tsconfig.json` | 伺服器本身的程式碼 |
| `services` | 為了要配合此伺服器執行，需要一些額外的服務配合。這裡可以找到一些設定檔 |
| `Dockerfile` | 伺服器本身包成docker image的方法。會用到不在repo中的`env`檔 |
| `docker-compose.yml` | 在本機執行所有的服務，不需要額外再安裝套件。會用到services底下的設定，也會用到不在repo中的`env`檔 |
| `README.md` | 本說明檔 |
| `test`、`.mocharc.yaml` | 本專案使用[mocha](https://mochajs.org/)進行測試，但並沒有完成撰寫所有的測試 |
| `LICENSE`、`COPYING` | 本專案因為使用的相關套件，以GPL v3授權 |

本專案所包含的環境檔非常多，均包含在.gitignore內。以下列出他們格式：

- .env.json

    ```json
    {
      "sqlCfgOld": {
        "host": "canchu-mysql-1",
        "user": "<username of MySQL>",
        "password": "<password of MySQL>",
        "database": "canchu",
        "waitForConnections": true,
        "connectionLimit": 3
      },
      "sqlUser": {
        "username": "<username of MySQL>",
        "password": "<password of MySQL>"
      },
      "jwtAccountSecret": "<password>",
      "apiVer": "1.0",
      "frontendAddr": "canchu-for-backend.vercel.app",
      "cacheAddr": "<the address holds backend service. No 'https://' required>",
      "cacheCfg": {
        "host": "canchu-cache-1",
        "username": "<username>",
        "password": "<password>"
      },
      "RDSAddr": "<address of Amazon RDS. Not required if using local MySQL in Docker>"
    }
    ```

    因此，MySQL資料庫、redis、RDS完全是可以定義的。除此之外，還可以指定環境變數`MODE`為`local`以使用在docker中的MySQL container。

- services/redis/passwd

    ```
    REDIS_PASSWORD=*********
    ```

- services/mysql/passwd

    ```
    MYSQL_PASSWORD=********
    MYSQL_ROOT_PASSWORD=***********
    ```

- services/nginx/cert/certificate.crt 以及 services/nginx/cert/private.key

    這兩個檔案是[申請HTTPS](https://www.sslforfree.com/)會得到的檔案。
