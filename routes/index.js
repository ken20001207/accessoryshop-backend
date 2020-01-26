// 需求文件
var M = require('../methods');
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var config = require('../config');
var ecpay_payment = require('ECPAY_Payment_node_js');

// 資料庫連線資訊
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'yuan',
  password: 'Yuanlin1207!',
  database: 'accessoryshop'
});

// 取得當前的主打商品類別
router.get('/flagclass', function (req, res) {
  res.status(200).write((config.flagclass).toString());
  res.end();
});

// 取得當前可用的寄送方式
router.get('/deliveryWay', function (req, res) {
  res.status(200).send(config.deliveryWay);
  res.end();
})

// 請求特定類別的商品
router.get('/itemsbyclass/:class', function (req, res) {

  connection.query('SELECT * FROM `items` WHERE `class`= ' + req.params.class, function (error, results) {

    if (error) throw error;

    res.status(200);
    var objs = [];
    for (var i = 0; i < results.length; i++) {
      objs.push(JSON.stringify(results[i]));
    }
    res.send(JSON.parse(JSON.stringify(objs)));
    res.end();
  });

});

// 請求商品類別清單
router.get('/classes', function (req, res) {

  connection.query('SELECT * FROM `classes`', function (error, results) {

    if (error) throw error;

    res.status(200);
    var objs = [];
    for (var i = 0; i < results.length; i++) {
      objs.push(JSON.stringify(results[i]));
    }
    res.send(JSON.parse(JSON.stringify(objs)));
    res.end();
  });

});

// 請求商品
router.get('/item/:id', function (req, res) {

  connection.query('SELECT * FROM `items` WHERE `id`= ' + req.params.id, function (error, results) {

    if (error) throw error;

    res.status(200);
    res.send(JSON.parse(JSON.stringify(results[0])));
    res.end();
  });

});

// 請求類別
router.get('/class/:id', function (req, res) {

  connection.query('SELECT * FROM `classes` WHERE `id`= ' + req.params.id, function (error, results) {

    if (error) throw error;

    res.status(200);
    res.send(JSON.parse(JSON.stringify(results[0])));
    res.end();
  });

});

var dateFormat = require('dateformat');
// 產生訂單
router.post('/sendorder', async function (req, res) {

  var date = new Date();
  date.setUTCHours(date.getHours() + 8);
  var time = dateFormat(date, "yyyy/mm/dd hh:MM:ss");

  console.log("\n\n");
  console.log(time + " 接收到了一筆新的訂單!");

  // 檢查優惠代碼
  console.log("該訂單使用了優惠代碼 " + req.body.couponCode);
  let couponData = await M.checkCouponCode(connection, req.body.couponCode);
  console.log(couponData);
  var discount = 0;
  var percentOFF = 0;
  if (couponData != "none") {
    discount = couponData.discount;
    percentOFF = couponData.percentOFF;
    console.log("該優惠代碼獲得了商品金額 NT$ " + discount + " 減免以及 " + (percentOFF * 100) + "% 減免")
  } else {
    couponData = {};
  }

  // 生成訂單編號
  let orderID = await M.generateOrderID(connection);
  console.log("生成訂單編號 " + orderID);

  // 構造訂單資料
  let orderData = await M.generateOrderData(req.body, connection);

  orderData.sumprice = orderData.sumprice - discount;
  orderData.sumprice = orderData.sumprice * (1 - percentOFF);

  let base_param = {
    ClientBackURL: 'https://demoshop.linyuanlin.com/#/order/' + orderID + '/',
    MerchantTradeNo: orderID.toString(),
    MerchantTradeDate: time.toString(),
    TotalAmount: orderData.sumprice.toString(),
    TradeDesc: '商品描述',
    ItemName: '飾品',
    ReturnURL: 'http://sgp.vt.linyuanlin.com:3000/paycomplete'
  };

  let create = new ecpay_payment();
  let htm = await create.payment_client.aio_check_out_all(parameters = base_param, invoice = {});

  // 上傳到資料庫
  connection.query('INSERT INTO `orders` (`id`,`data`,`sumprice`,`statusCode`,`delivery`,`payform`, `couponData`) VALUES (\'' + orderID + '\' , \'' + JSON.stringify(orderData.orderData) + '\', \'' + orderData.sumprice + '\',1,\'' + JSON.stringify(req.body.delivery) + '\',\'' + htm + '\', \'' + JSON.stringify(couponData) + '\');');

  res.status(200);
  res.send({ orderID: orderID.toString(), payform: htm, couponData: couponData, orderData: orderData });
  res.end();
})

// 取得訂單
router.get('/order/:id', function (req, res) {

  connection.query('SELECT * FROM `orders` WHERE `id`= ' + req.params.id, function (error, results) {

    if (error) {
      res.status(500);
      res.send("資料庫連接發生問題");
      res.end();
    } else if (results.length == 0) {
      res.status(404);
      res.send("無該訂單");
      res.end();
    } else {
      res.status(200);
      res.send(JSON.parse(JSON.stringify(results[0])));
      res.end();
    }
  });

});

// 綠界科技回報付款結果
router.post('/paycomplete', async function (req, res) {
  console.log("收到訂單付款完成的通知!");
  console.log("訂單編號 " + req.body.MerchantTradeNo + " 狀態更新為 " + req.body.RtnMsg);
  await M.updatePayResult(req.body.MerchantTradeNo, req.body.RtnMsg, connection);
  res.status(200).write(("1|OK").toString());
  res.end();
})

// 更新訂單寄送資訊
router.post('/updateDelivery', async function (req, res) {

  console.log("\n\n");
  console.log("訂單編號 " + req.body.id + " 更新了他的寄送資訊: ");
  M.updateDelivery(req.body.id, req.body.delivery, req.body.delivery_info, connection);
  console.log("寄送方式為 " + req.body.delivery + " , 寄送到 " + req.body.delivery_info);
  res.status(200);
  res.end();
})

module.exports = router;
