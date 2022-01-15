var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');
const app = getApp()
// 触底上拉刷新 TODO 这里要将page传给服务器，作者没写

// 订单状态
const STATUS_MAP = {
    '0': '待付款',
    '1': '待发货',
    '2': '待收货',
    '3': '已完成',
    '4': '已关闭'
}
Page({
    data: {
        orderList: [],
        allOrderList: [],
        pageNum: 1,
        totalPage: 1,
        pageSize: 10,
        showType: -1,
        showTips: 0,
        status: {} // 各个状态的订单数量，暂未使用
    },
    toOrderDetails: function(e) {
        let orderId = e.currentTarget.dataset.id;
        wx.setStorageSync('orderId', orderId)
        wx.navigateTo({
            url: '/pages/ucenter/order-details/index',
        })
    },
    payOrder: function(e) {
        let orderId = e.currentTarget.dataset.orderid;
        let that = this;
        pay.payOrder(parseInt(orderId)).then(res => {
            let showType = wx.getStorageSync('showType');
            that.setData({
                showType: showType,
                orderList: [],
                allOrderList: [],
                pageNum: 1,
                pageSize: 10
            });
            that.getOrderList();
            // that.getOrderInfo();
        }).catch(res => {
            util.showErrorToast(res.errmsg);
        });
    },
    // getOrderInfo: function(e) {
    //     util.request(api.OrderCountInfo).then((res) => {
    //         if (res.code === 200) {
    //             let status = res.data;
    //             this.setData({
    //                 status: status
    //             });
    //         }
    //     });
    // },
    getOrderList() {
        const { showType, pageSize, pageNum, orderList } = this.data;
        util.request(api.OrderList, {
            status: showType || -1,
            pageSize,
            pageNum
        }).then((res) => {
            const { code, data } = res;
            if (code === 200) {
                const { totalPage, list } = data;
                this.setData({
                    totalPage,
                    orderList: orderList.concat(list.map(item => ({
                        ...item,
                        statusName: STATUS_MAP[item.status]
                    })))
                })
            }
        });
    },
    toIndexPage: function(e) {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    onLoad: function() {},
    onShow: function() {
        let showType = wx.getStorageSync('showType');
        let nowShowType = this.data.showType;
        let doRefresh = wx.getStorageSync('doRefresh');
        if (nowShowType != showType || doRefresh == 1) {
            this.setData({
                showType,
                orderList: [],
                allOrderList: [],
                pageNum: 1,
                pageSize: 10
            });
            // this.getOrderList();
            wx.removeStorageSync('doRefresh');
        }
        this.getOrderList();
        // this.getOrderInfo();
    },
    switchTab: function(event) {
        let showType = event.currentTarget.dataset.index;
        wx.setStorageSync('showType', showType);
        this.setData({
            showType: showType,
            orderList: [],
            allOrderList: [],
            pageNum: 1,
            pageSize: 10
        });
        // this.getOrderInfo();
        this.getOrderList();
    },
    // “取消订单”点击效果
    cancelOrder: function(e) {
        let that = this;
        let orderId = e.currentTarget.dataset.index;
        wx.showModal({
            title: '',
            content: '确定要取消此订单？',
            success: function(res) {
                if (res.confirm) {
                    util.request(api.OrderCancel, {
                        orderId: orderId
                    }, 'POST').then(function(res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '取消订单成功'
                            });
                            that.setData({
                                orderList: [],
                                allOrderList: [],
                                pageNum: 1,
                                pageSize: 10
                            });
                            that.getOrderList();
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
    onReachBottom: function() {
        const { pageNum, totalPage } = this.data;
        if (pageNum === totalPage) {
            this.setData({
                showTips: 1
            });
            return false;
        }
        this.setData({
            pageNum: pageNum + 1
        });
        this.getOrderList();
    }
})