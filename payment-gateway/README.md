# Payment gateway
This is an example to show how to integrate express server with Braintree and Paypal service.


## Installation
If you are not using Yarn but NPM, you may replace all **_yarn_** below with **_npm_**.

`yarn`

## Configuration 
Rename the _src/_**_config.example.json_** to **_config.json_**, fill in your keys created from your Paypayl and Braintree account.
```json
{
  "port": 8080,
  "redisPort": 6379,
  "mongoUrl": "mongodb://localhost:27017/paymentdb",
  "paypalConfig": {
    "mode": "sandbox",
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET"
  },
  "braintreeConfig": {
    "environment": "sandbox",
    "merchantId": "YOUR_MERCHANT_ID",
    "publicKey": "YOUR_PUBLIC_KEY",
    "privateKey": "YOUR_PRIVATE_KEY"
  }
}
```

## Environment preparation
To start the payment gateway server, you have to start your MongoDB and Redis first.

MongoDB with port 27017
```
yarn run start-mongodb
```
or 
```
mongod --dbpath=[your mongo db path] --port 27017
```

Redis with default port 6379
```
yarn run start-redis
```
or 
```
redis-server
```

## Start the payment gateway server
```
yarn start
```

## Testing 
To obtain testing credit card information, you can refer to the testing data from [Braintree](https://developers.braintreepayments.com/reference/general/testing/node)
