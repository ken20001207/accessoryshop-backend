var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var ecpay_payment = require('ECPAY_Payment_node_js');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'accessoryshop'
});

connection.connect();

// 取得當前的主打商品類別
router.get('/flagclass', function (req, res) {
  connection.query('SELECT * FROM `data`', function (error, results) {

    if (error) throw error;

    res.status(200).write((results[0].flagclass).toString());
    res.end();
  });

});

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
  return new Promise(async function (resolve, reject) {
    var orderData = [];
    var sumprice = 0;
    for (var i = 0; i < shoppingCartData.items.length; i++) {
      var item = shoppingCartData.items[i];
      let price = await getItemPrice(item.id);
      item.price = price;
      console.log(item.num + " 個 " + item.name + " (規格: " + item.option + ") 單價為 " + item.price + "元, 合計 " + item.price * item.num + "元");
      sumprice += item.price * item.num;
      orderData.push(item);
    }
    resolve({ orderData: orderData, sumprice: sumprice });
  })
}

// 產生訂單
router.post('/sendorder', async function (req, res) {

  console.log("\n\n");
  console.log("接收到了一筆新的訂單!");

  // 生成訂單編號
  let orderID = await generateOrderID();
  console.log("生成訂單編號 " + orderID);

  // 構造訂單資料
  let orderData = await generateOrderData(req.body);

  // 上傳到資料庫
  connection.query('INSERT INTO `orders` (`id`,`data`,`sumprice`) VALUES (\'' + orderID + '\' , \'' + JSON.stringify(orderData.orderData) + '\', \'' + orderData.sumprice + '\');', function (error, results) {
  });

  let base_param = {
    MerchantTradeNo: 'f0a0d7e9fae1bb72bc93', //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
    MerchantTradeDate: Date.now(), //ex: 2017/02/13 15:45:30
    TotalAmount: orderData.sumprice,
    TradeDesc: '測試交易描述',
    ItemName: '測試商品等',
    ReturnURL: 'http://localhost:8080/order/' + orderID,
    EncryptType: '1'
  };

  let inv_params = { /*
     RelateNumber: 'SJDFJGH24FJIL97G73653XM0VOMS4K',  //請帶30碼uid ex: SJDFJGH24FJIL97G73653XM0VOMS4K
     CustomerID: '',  //會員編號
     CustomerIdentifier: '',   //統一編號
     CustomerName: '測試買家',
     CustomerAddr: '測試用地址',
     CustomerPhone: '0123456789',
     CustomerEmail: 'johndoe@test.com',
     ClearanceMark: '2',
     TaxType: '1',
     CarruerType: '',
     CarruerNum: '',
     Donation: '2',
     LoveCode: '',
     Print: '1',
     InvoiceItemName: '測試商品1|測試商品2',
     InvoiceItemCount: '2|3',
     InvoiceItemWord: '個|包',
     InvoiceItemPrice: '35|10',
     InvoiceItemTaxType: '1|1',
     InvoiceRemark: '測試商品1的說明|測試商品2的說明',
     DelayDay: '0',
     InvType: '07' */
};

  let create = new ecpay_payment();
  let htm = create.payment_client.aio_check_out_all(parameters = base_param, invoice = inv_params);
  console.log(htm);

  res.status(200);
  res.write(orderID.toString());
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
