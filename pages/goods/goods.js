var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var timer = require('../../utils/wxTimer.js');
var api = require('../../config/api.js');
const user = require('../../services/user.js');
Page({
    data: {
        id: 0,
        goods: {},
        showShare: 0, // 是否展示分享按钮，暂时隐藏
        gallery: [],
        // galleryImages:[],
        // specificationList: [],
        skuStockList: [],
        checkedSku: {}, // 选择的sku数据
        productList: [],
        cartGoodsCount: 0,
        checkedSpecPrice: 0,
        number: 1,
        checkedSpecText: '请选择规格和数量', // 规格和数量选中文本
        tmpSpecText: '请选择规格和数量', // 选择sku弹层中规格数量选中文本
        openAttr: false,
        soldout: false,
        cutDisabled: true,
        // alone_text: '单独购买',
        userId: 0,
        // priceChecked: false,
        goodsNumber: 0,
        loading: 0,
        current: 0,
        showShareDialog:0,
        userInfo:{},
        autoplay:true
    },
    hideDialog: function (e) {
        let that = this;
        that.setData({
            showShareDialog: false,
        });
    },
    shareTo:function(){
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo == '') {
            util.loginNow();
            return false;
        } else {
            this.setData({
                showShareDialog: !this.data.showShareDialog,
            });
        }
    },
    createShareImage: function () {
        let id = this.data.id;
        wx.navigateTo({
            url: '/pages/share/index?goodsid=' + id
        })
    },
    previewImage: function (e) {
        let current = e.currentTarget.dataset.src;
        let that = this;
        wx.previewImage({
            current: current, // 当前显示图片的http链接  
            urls: that.data.gallery // 需要预览的图片http链接列表  
        })
    },
    bindchange: function(e) {
        let current = e.detail.current;
        this.setData({
            current: current
        })
    },
    inputNumber(event) {
        this.setData({
            number: event.detail.value
        });
    },
    goIndex: function() {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },
    onShareAppMessage: function(res) {
        let id = this.data.id;
        let name = this.data.goods.name;
        let image = this.data.goods.list_pic_url;
        let userId = this.data.userId;
        return {
            title: name,
            path: '/pages/goods/goods?id=' + id + '&&userId=' + userId,
            imageUrl: image
        }
    },
    onUnload: function() {},
    handleTap: function(event) { //阻止冒泡 
    },
    getGoodsInfo: function() {
        let that = this;
        const { id } = this.data;
        util.request(api.GoodsDetail, { id }).then((res) => {
            const { code, data } = res;
            if (code === 200) {
                let _specificationList = data.productAttributeList.filter(item => item.type === 0)
                    .map(item => ({...item, valueList: item.inputList.split(',')}));
                // 如果仅仅存在一种货品，那么商品页面初始化时默认checked
                if (_specificationList && _specificationList.length == 1) {
                    _specificationList.valueList[0].checked = true
                    this.setData({
                        checkedSpecText: '已选择：' + _specificationList.valueList[0].value,
                        tmpSpecText: '已选择：' + _specificationList.valueList[0].value,
                    });
                } else {
                    this.setData({
                        checkedSpecText: '请选择规格和数量'
                    });
                }
                const { product } = data;
                this.setData({
                    goods: product,
                    goodsNumber: product.stock, // 库存数量
                    gallery: product.albumPics ? product.albumPics.split(',') : [product.pic], // 商品图片列表
                    // specificationList: data.skuStockList,
                    skuStockList: data.skuStockList.map(item => ({
                        ...item,
                        skuValue: JSON.parse(item.spData).map(item => `${item.key} : ${item.value}; `).join(' ')
                    })),
                    originalPrice: product.originalPrice,
                    // galleryImages: galleryImages,
                    loading: 1
                });
                setTimeout(() => {
                    WxParse.wxParse('goodsDetail', 'html', product.detailHtml || '暂无详情', that);
                }, 300);
                wx.setStorageSync('goodsImage', product.pic);
            }
            else{
                util.showErrorToast(res.errmsg)
            }
        });
    },
    clickSkuValue: function(event) {
        const { skuCode } = event.target.dataset;
        this.setData({
            checkedSku: this.getCheckedSku(skuCode)
        });
        //重新计算spec改变后的信息
        this.changeSpecInfo();
    },
    //获取选中的规格信息
    getCheckedSku: function(skuCode) {
        const { skuStockList } = this.data;
        return skuCode ? skuStockList.find(sku => sku.skuCode === skuCode) : skuStockList[0]
    },
    // 选中规格
    changeSpecInfo: function() {
        const { checkedSku } = this.data;
        const { skuValue, price, stock } = checkedSku;
        this.setData({
            checkedSku,
            cutDisabled: true,
            goodsNumber: stock,
            checkedSpecPrice: price,
            tmpSpecText: '已选择：' + skuValue,
            checkedSpecText: '已选择：' + skuValue,
            number: 1
        })
        this.checkSku();
    },
    onLoad: function(options) {
        const { id } = options;
        // 商品id
        if (id) {
            this.setData({ id });
        }
    },
    onShow: function() {
        let userInfo = wx.getStorageSync('userInfo');
        let info = wx.getSystemInfoSync();
        let sysHeight = info.windowHeight - 100;
        let userId = userInfo.id;
        if (userId > 0) {
            this.setData({
                userId: userId,
                userInfo: userInfo,
            });
        }
        this.setData({
            priceChecked: false,
            sysHeight: sysHeight
        })
        this.getGoodsInfo();
    },
    onHide:function(){
        this.setData({
            autoplay:false
        })
    },
    onPullDownRefresh: function() {
        wx.showNavigationBarLoading()
        this.getGoodsInfo();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    openCartPage: function() {
        wx.switchTab({
            url: '/pages/cart/cart',
        });
    },
    goIndexPage: function() {
        wx.switchTab({
            url: '/pages/index/index',
        });
    },
    // 打开选择规格弹层
    switchAttrPop: function() {
        const { openAttr } = this.data;
        if (openAttr == false) {
            this.setData({
                openAttr: !openAttr
            });
        }
    },
    closeAttr: function() {
        this.setData({
            openAttr: false
        });
    },
    // 登录验证: 判断是否登录，如果没有登录，则登录
    checkLogin() {
        util.loginNow();
        const userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) return false;
        return true;
    },
    // sku验证
    checkSku() {
        const { openAttr, skuStockList, checkedSku, number } = this.data;
        if (openAttr == false && skuStockList.length != 1) {
            //打开规格选择窗口
            this.setData({ openAttr: !openAttr });
            return false;
        } else {
            // sku不存在
            if(!skuStockList.length) {
                util.showErrorToast('库存不足');
                return false;
            }
            const { stock, skuCode } = checkedSku;
            //提示选择完整规格
            if (!skuCode) {
                util.showErrorToast('请选择规格');
                return false;
            }
            // 库存校验
            if (!stock) {
                util.showErrorToast('该规格所对应货品不存在');
                return false;
            }
            if (stock < number) {
                util.showErrorToast('库存不足');
                return false;
            }
        }
        return true;
    },
    // 加入购物车
    fetchAddCart(callback) {
        wx.showLoading({
          title: '加入购物车...',
          mask: true
        })
        const { goods, checkedSku, number, gallery } = this.data;
        const { price, productId, skuCode, spData } = checkedSku;
        const cartItem = {
            // createDate: "2022-01-09T02:29:01.166Z",
            // deleteStatus: 0,
            // id: 0,
            // memberId: 0,
            // memberNickname: "string",
            // modifyDate: "2022-01-09T02:29:01.166Z",
            price,
            productAttr: spData,
            productBrand: goods.brandName,
            productCategoryId: goods.productCategoryId,
            productId,
            productName: goods.name,
            productPic: gallery[0],
            productSkuCode: skuCode,
            productSkuId: skuCode,
            productSn: goods.productSn,
            productSubTitle: goods.subTitle,
            quantity: number
        }
        util.request(api.CartAdd, { ...cartItem }, "POST")
            .then((res) => {
                wx.hideLoading()
                const { code, data } = res;
                if (code === 200) {
                    callback(data);
                } else {
                    wx.showToast({
                        image: '/images/icon/icon_error.png',
                        title: res.message,
                    });
                }
            });
    },
    // 加入购物车
    addToCart() {
        if(this.checkLogin() && this.checkSku()) {
            const { skuStockList, openAttr } = this.data;
            this.fetchAddCart((data) => {
                wx.showToast({
                    title: '添加成功',
                });
                if (skuStockList.length != 1 || openAttr == true) {
                    this.setData({
                        openAttr: !openAttr,
                        cartGoodsCount: _res.data.cartTotal.goodsCount
                    });
                } else {
                    this.setData({
                        cartGoodsCount: _res.data.cartTotal.goodsCount
                    });
                }
            });
        }
    },
    // 立即购买
    fastToCart() {
        if (this.checkLogin() && this.checkSku()) {
            this.fetchAddCart((data) => {
                if (data) {
                    console.log(data);
                    let id = this.data.id;
                    wx.navigateTo({
                        url: '/pages/order-check/index?addtype=1'
                    });
                } else {
                    wx.showToast({
                        image: '/images/icon/icon_error.png',
                        title: _res.errmsg,
                    });
                }
            });
        }
    },
    cutNumber: function() {
        const { number } = this.data;
        this.setData({
            number: (number - 1 > 1) ? number - 1 : 1,
            cutDisabled: number === 2 ? true : false
        });
    },
    addNumber: function() {
        this.setData({
            number: Number(this.data.number) + 1,
            cutDisabled: false
        });
    }
})