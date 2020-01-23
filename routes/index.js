// 設定檔
const config = {
  flagclass: 1,
  deliveryWay: [
    {
      name: "全家超商取貨",
      price: 40
    }, {
      name: "統一超商取貨",
      price: 40
    }, {
      name: "黑貓宅急便",
      price: 80
    }, {
      name: "中華郵政",
      price: 60
    },
  ]
};

// 需求文件
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var ecpay_payment = require('ECPAY_Payment_node_js');

// 資料庫連線資訊
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'yuan',
  password: 'Yuanlin1207!',
  database: 'accessoryshop'
});

connection.connect();

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

/** 產生訂單編號 */
function generateOrderID() {
  return new Promise(function (resolve, reject) {
    var orderID = Math.floor(Math.random() * 100000000000);
    connection.query('SELECT * FROM `orders` WHERE `id`=' + orderID, function (error, results) {

      if (error) reject(error);

      if (results.length != 0) {
        // 訂單編號已被使用，重新獲取
        orderID = Math.floor(Math.random() * 100000000000);
        resolve(orderID);
      } else {
        resolve(orderID);
      }

    });
  })
}

/** 用商品編號取得商品當前售價 */
function getItemPrice(id) {
  return new Promise(function (resolve, reject) {
    connection.query('SELECT * FROM `items` WHERE `id`= ' + id, function (error, results) {
      if (error) reject(error);
      else resolve(results[0].price);
    })
  })
}

/** 用購物車資料生成訂單資料 */
function generateOrderData(shoppingCartData) {
  return new Promise(async function (resolve) {
    var orderData = [];
    var sumprice = 0;

    // 檢查每一個商品的當前價格並加總
    for (var i = 0; i < shoppingCartData.items.length; i++) {
      var item = shoppingCartData.items[i];
      let price = await getItemPrice(item.id);
      item.price = price;
      console.log(item.num + " 個 " + item.name + " (規格: " + item.option + ") 單價為 " + item.price + "元, 合計 " + item.price * item.num + "元");
      sumprice += item.price * item.num;
      orderData.push(item);
    }

    // 找到運費並加入總金額
    for (i = 0; i < config.deliveryWay.length; i++) {
      if (config.deliveryWay[i].name == shoppingCartData.delivery.way) {
        console.log("運送方式為 " + config.deliveryWay[i].name + " 需要運費 " + config.deliveryWay[i].price + " 元");
        sumprice += config.deliveryWay[i].price;
        break;
      }
    }

    resolve({ orderData: orderData, sumprice: sumprice });
  })
}
var dateFormat = require('dateformat');
// 產生訂單
router.post('/sendorder', async function (req, res) {

  var time = dateFormat(new Date(), "yyyy/mm/dd hh:MM:ss");

  console.log("\n\n");
  console.log(time + " 接收到了一筆新的訂單!");

  // 生成訂單編號
  let orderID = await generateOrderID();
  console.log("生成訂單編號 " + orderID);

  // 構造訂單資料
  let orderData = await generateOrderData(req.body);

  let base_param = {
    ClientBackURL: 'http://localhost:8080/order/' + orderID,
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
  connection.query('INSERT INTO `orders` (`id`,`data`,`sumprice`,`statusCode`,`delivery`,`payform`) VALUES (\'' + orderID + '\' , \'' + JSON.stringify(orderData.orderData) + '\', \'' + orderData.sumprice + '\',1,\'' + JSON.stringify(req.body.delivery) + '\',\'' + htm +'\');', function (error, results) {
  });

  res.status(200);
  res.send({ orderID: orderID.toString(), payform: htm });
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

// 收到付款完成的通知
router.post('/paycomplete', function (req, res) {
  console.log("收到訂單付款完成的通知!");
  console.log(req.body);
  res.status(200).write(("1|OK").toString());
  res.end();
})

/** 更新訂單寄送資訊 */
function updateDelivery(id, delivery, delivery_info) {
  return new Promise(function (resolve, reject) {
    connection.query("UPDATE `orders` SET `delivery` = \'" + delivery + "\' , `delivery_info`=\'" + delivery_info + "\' WHERE `id`=" + id, err => {
      if (err) reject(err);
      else resolve();
    })
  })
}

// 更新訂單寄送資訊
router.post('/updateDelivery', async function (req, res) {

  console.log("\n\n");
  console.log("訂單編號 " + req.body.id + " 更新了他的寄送資訊: ");
  updateDelivery(req.body.id, req.body.delivery, req.body.delivery_info);
  console.log("寄送方式為 " + req.body.delivery + " , 寄送到 " + req.body.delivery_info);
  res.status(200);
  res.end();
})

module.exports = router;
