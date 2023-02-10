# Bot-GalaxyFinance

## 1. Cài đặt

- Cài nodejs
- Cài yarn
- Chạy lệnh 'yarn' trên terminal
- Cài git và clone về, sau mình update thêm code chỉ việc pull về chạy tiếp

## 2. Chỉnh lại file env

- Nhập địa chỉ private key của ví mà harvest tiền vào "PRIVATE_KEY"
- Nhập địa chỉ public key của ví sẽ nhận đồng Galaxy vào "RECIPIENT"
- POOL_STAKE là PoolID của cái mình đang Stake (Của bạn là id 3, 4)
- POOL_UNSTAKE là PoolID của cái mình muốn withdraw (Của bạn là id 3, 4)

## Thực hiện harvest và chuyển tiền luôn

- LƯU Ý: trước khi chạy lệnh nên check lại thông tin ở file env, tránh chuyển tiền nhầm

```shell
$ node index.js
```

## Thực hiện unstake và chuyển tiền luôn

- LƯU Ý: trước khi chạy lệnh nên check lại thông tin ở file env, tránh chuyển tiền nhầm

```shell
$ node GalaxyUnstake.js
```

## Chạy bot lắng nghe tiền Galaxy về ví bị hack

```shell
$ node GalaxyBot.js
```

## Chạy bot lắng nghe số dư BNB ở ví bị hack

```shell
$ node CheckBalance.js
```

## Chạy bot 10 phút 1 lần lấy tiền (dùng pm2)

```shell
$ node indexV2.js
```
