var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const app = getApp()

Page({
    data: {
        cartGoods: [],
        cartTotal: {
            "checkedGoodsCount": 0,
            "checkedGoodsAmount": 0.00,
        },
        checkedAllStatus: true,
        isTouchMove: false,
        startX: 0, //开始坐标
        startY: 0
    },
    onLoad: function() {
    },
    onReady: function() {
        // 页面渲染完成
    },
    onShow: function() {
        // 页面显示
        this.getCartList();
        wx.removeStorageSync('categoryId');
    },
    goGoodsDetail(e){
        const { productId } = e.currentTarget.dataset;
        wx.navigateTo({
          url: '/pages/goods/goods?id='+productId,
        })
    },
    nothing:function(){

    },
    onPullDownRefresh: function() {
        wx.showNavigationBarLoading()
        this.getCartList();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    onHide: function() {
        // 页面隐藏
    },
    onUnload: function() {
        // 页面关闭
    },
    toIndexPage: function() {
        wx.switchTab({
            url: '/pages/index/index',
        });
    },
    getCartList: function() {
        util.request(api.CartList).then((res) => {
            const { data, code } = res;
            if (code === 200) {
                this.setData({
                    cartGoods: data.map(item => ({
                        ...item,
                        checked: true,
                        price: item.price.toFixed(2)
                    })),
                });
                this.getCheckedGoodsCount();
                // if (data.cartTotal.numberChange == 1) {
                //     util.showErrorToast('部分商品库存有变动');
                // }
                // 购物车数量更新
                if (data.length == 0) {
                    wx.removeTabBarBadge({
                        index: 2,
                    })
                } else {
                    wx.setTabBarBadge({
                        index: 2,
                        text: data.length + ''
                    })
                }
            }
            this.isCheckedAll();
        });
    },
    //判断购物车商品已全选
    isCheckedAll() {
        this.setData({
            checkedAllStatus: this.data.cartGoods.every(item => item.checked)
        })
    },
    // 计算合计价格
    getCheckedGoodsCount() {
        let checkedGoodsCount = 0;
        let checkedGoodsAmount = 0;
        this.data.cartGoods.forEach(item => {
            if (item.checked === true) {
                checkedGoodsCount += item.quantity;
                checkedGoodsAmount += item.quantity * item.price
            }
        });
        this.setData({ 
            cartTotal: {
                checkedGoodsCount,
                checkedGoodsAmount: checkedGoodsAmount.toFixed(2)
            }
        });
    },
    // 全选按钮
    checkedAll: function() {
        const { checkedAllStatus } = this.data;
        this.setData({
            cartGoods: this.data.cartGoods.map(item => ({
                ...item,
                checked: !checkedAllStatus
            }))
        });
        this.isCheckedAll();
        this.getCheckedGoodsCount();
    },
    // 修改商品数量
    changeProductNumber(id, quantity){
        util.request(api.CartUpdateNumber, { id, quantity }).then(res => {
            if(!res || res.code !== 200) {
                util.showErrorToast('修改失败')
            }
        })
    },
    cutNumber: function(event) {
        const { itemId } = event.target.dataset;
        const { cartGoods } = this.data;
        const { quantity } = cartGoods.find(item => item.id === itemId);
        if (quantity - 1 == 0) {
            util.showErrorToast('删除左滑试试')
        } else {
            this.setData({
                cartGoods: cartGoods.map(item => ({
                    ...item,
                    quantity: itemId === item.id ? item.quantity - 1 : item.quantity
                })),
            });
            this.changeProductNumber(itemId, quantity-1);
        }
        this.getCheckedGoodsCount();
    },
    addNumber: function(event) {
        const { itemId } = event.target.dataset;
        const { cartGoods } = this.data;
        const { quantity } = cartGoods.find(item => item.id === itemId);
        this.setData({
            cartGoods: cartGoods.map(item => ({
                ...item,
                quantity: itemId === item.id ? item.quantity + 1 : item.quantity
            })),
        });
        this.changeProductNumber(itemId, quantity+1);
        this.getCheckedGoodsCount();
    },
    // 去结算
    checkoutOrder: function() {
        //获取已选择的商品
        util.loginNow();
        var checkedGoods = this.data.cartGoods.filter(item => item.checked);
        if (checkedGoods.length <= 0) {
            util.showErrorToast('请先选择要结算的商品');
            return false;
        }
        wx.navigateTo({
            url: `/pages/order-check/index?cartIds=${checkedGoods.map(item => item.productSkuId)}`
        })
    },
    checkedItem: function(e) {
        const { itemId } = e.currentTarget.dataset;
        const { cartGoods } = this.data;
        this.setData({
            cartGoods: cartGoods.map(item => ({
                ...item,
                checked: itemId === item.id ? !item.checked : item.checked
            })),
        })
        this.isCheckedAll();
        this.getCheckedGoodsCount();
    },
    touchstart: function(e) {
        //开始触摸时 重置所有删除
        this.data.cartGoods.forEach(function(v, i) {
            if (v.isTouchMove) //只操作为true的
                v.isTouchMove = false;
        })
        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            cartGoods: this.data.cartGoods
        })
    },
    //滑动事件处理
    touchmove: function(e) {
        var that = this,
            index = e.currentTarget.dataset.index, //当前索引
            startX = that.data.startX, //开始X坐标
            startY = that.data.startY, //开始Y坐标
            touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
            touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
            //获取滑动角度
            angle = that.angle({
                X: startX,
                Y: startY
            }, {
                X: touchMoveX,
                Y: touchMoveY
            });
        that.data.cartGoods.forEach(function(v, i) {
            v.isTouchMove = false
            //滑动超过30度角 return
            if (Math.abs(angle) > 30) return;
            if (i == index) {
                if (touchMoveX > startX) //右滑
                    v.isTouchMove = false
                else //左滑
                    v.isTouchMove = true
            }
        })
        //更新数据
        that.setData({
            cartGoods: that.data.cartGoods
        })
    },
    /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
    angle: function(start, end) {
        var _X = end.X - start.X,
            _Y = end.Y - start.Y
        //返回角度 /Math.atan()返回数字的反正切值
        return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    },
    //删除已选择的商品
    deleteGoods: function(e) {
        const { itemId } = e.currentTarget.dataset;
        util.request(api.CartDelete, {
            ids : itemId
        }, 'POST', 'query').then((res) => {
            const { code, data } = res;
            if (code === 200) {
                console.log(data);
                this.getCartList();
            }
        });
    }
})