
/** 更新訂單寄送資訊 */
exports.updateDelivery = function updateDelivery(id, delivery, delivery_info) {
    return new Promise(function (resolve, reject) {
        connection.query("UPDATE `orders` SET `delivery` = \'" + delivery + "\' , `delivery_info`=\'" + delivery_info + "\' WHERE `id`=" + id, err => {
            if (err) reject(err);
            else resolve();
        })
    })
},

/** 更新訂單狀態 */
exports.updatePayResult = function updatePayResult(id, result) {
    return new Promise(function (resolve, reject) {
        connection.query("UPDATE `orders` SET `payresult` = \'" + result + "\' WHERE `id`=" + id, err => {
            if (err) reject(err);
            else resolve();
        })
    })
},

/** 用購物車資料生成訂單資料 */
exports.generateOrderData = function generateOrderData(shoppingCartData) {
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
                console.log("運送方式為 " + config.deliveryWay[i].name + " 需要運費 " + config.deliveryWay[i].price + " 元\n\n");
                sumprice += config.deliveryWay[i].price;
                break;
            }
        }

        resolve({ orderData: orderData, sumprice: sumprice });
    })
},

/** 用商品編號取得商品當前售價 */
exports.getItemPrice = function getItemPrice(id) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM `items` WHERE `id`= ' + id, function (error, results) {
            if (error) reject(error);
            else resolve(results[0].price);
        })
    })
},

/** 產生訂單編號 */
exports.generateOrderID = function generateOrderID() {
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
