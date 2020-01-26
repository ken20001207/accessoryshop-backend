let config = require('./config');

/** 更新訂單寄送資訊 */
function updateDelivery(id, delivery, delivery_info, connection) {
    return new Promise(function (resolve, reject) {
        connection.query("UPDATE `orders` SET `delivery` = \'" + delivery + "\' , `delivery_info`=\'" + delivery_info + "\' WHERE `id`=" + id, err => {
            if (err) reject(err);
            else resolve();
        })
    })
}
exports.updateDelivery = updateDelivery;

/** 更新訂單狀態 */
function updatePayResult(id, result, connection) {
    return new Promise(function (resolve, reject) {
        connection.query("UPDATE `orders` SET `payresult` = \'" + result + "\' WHERE `id`=" + id, err => {
            if (err) reject(err);
            else resolve();
        });
    })
}
exports.updatePayResult = updatePayResult;

/** 用購物車資料生成訂單資料 */
function generateOrderData(shoppingCartData, connection) {
    return new Promise(async function (resolve) {
        var orderData = [];
        var sumprice = 0;

        // 檢查每一個商品的當前價格並加總
        for (var i = 0; i < shoppingCartData.items.length; i++) {
            var item = shoppingCartData.items[i];
            let price = await getItemPrice(item.id, connection);
            item.price = price;
            console.log(item.num + " 個 " + item.name + " (規格: " + item.option + ") 單價為 " + item.price + "元, 合計 " + item.price * item.num + "元");
            sumprice += item.price * item.num;
            orderData.push(item);
        }

        // 找到運費並加入總金額
        for (i = 0; i < config.deliveryWay.length; i++) {
            if (config.deliveryWay[i].name == shoppingCartData.delivery.way) {
                console.log("運送方式為 " + config.deliveryWay[i].name + " 需要運費 " + config.deliveryWay[i].price + " 元\n\n");
                sumprice += config.deliveryWay[i].price;
                break;
            }
        }

        resolve({ orderData: orderData, sumprice: sumprice });
    })
}
exports.generateOrderData = generateOrderData;

/** 用商品編號取得商品當前售價 */
function getItemPrice(id, connection) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM `items` WHERE `id`= ' + id, function (error, results) {
            if (error) reject(error);
            else resolve(results[0].price);
        })
    })
}
exports.getItemPrice = getItemPrice;

/** 產生訂單編號 */
function generateOrderID(connection) {
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
exports.generateOrderID = generateOrderID;

/** 檢查優惠代碼 */
function checkCouponCode(connection, couponCode) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM `coupons` WHERE `id`=\'' + couponCode + '\' AND `available` = 1', function(err, results) {
            if(err) reject(err);
            if(results.length == 0) {
                resolve("none");
            } else {
                updateCouponCode(connection, couponCode);
                resolve({
                    percentOFF: results[0].percentOFF,
                    discount: results[0].discount,
                    id: couponCode
                });
            }
        })
    })
}
exports.checkCouponCode = checkCouponCode;

/** 更新優惠代碼狀態 */
function updateCouponCode(connection, couponCode) {
    return new Promise(function (resolve, reject) {
        connection.query('UPDATE `coupons` SET `available` = 0 WHERE `id` = \'' + couponCode + '\'' , function(err) {
            console.log('UPDATE `coupons` SET `available` = 0 WHERE `id` = \'' + couponCode + '\'')
            if(err) reject(err);
            else resolve();
        })
    })
}
exports.updateCouponCode = updateCouponCode;