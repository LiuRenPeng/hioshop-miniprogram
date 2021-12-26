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
        checkedSkuCode: "",
        productList: [],
        cartGoodsCount: 0,
        checkedSpecPrice: 0,
        number: 1,
        checkedSpecText: '请选择规格和数量', // 规格和数量选中文本
        tmpSpecText: '请选择规格和数量', // 选择sku弹层中规格数量选中文本
        openAttr: false,
        soldout: false,
        disabled: '',
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
        util.request(api.GoodsDetail, {
            id: that.data.id
        }).then(function(res) {
            const { code, data } = res;
            // console.log('-------------商详页', data)
            if (code === 200) {
                let _specificationList = data.productAttributeList.filter(item => item.type === 0)
                    .map(item => ({...item, valueList: item.inputList.split(',')}));
                // 如果仅仅存在一种货品，那么商品页面初始化时默认checked
                if (_specificationList && _specificationList.length == 1) {
                    _specificationList.valueList[0].checked = true
                    that.setData({
                        checkedSpecText: '已选择：' + _specificationList.valueList[0].value,
                        tmpSpecText: '已选择：' + _specificationList.valueList[0].value,
                    });
                } else {
                    that.setData({
                        checkedSpecText: '请选择规格和数量'
                    });
                }
                // let galleryImages = [];
                // for (const item of res.data.gallery) {
                //     galleryImages.push(item.img_url);
                // }
                const { product } = data;
                that.setData({
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
                    loading:1
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
        // console.log('skuCode', skuCode)
        this.setData({
            checkedSkuCode: skuCode
        });
        //重新计算spec改变后的信息
        this.changeSpecInfo();
    },
    //获取选中的规格信息
    getCheckedSpecValue: function() {
        const { skuStockList, checkedSkuCode } = this.data;
        return checkedSkuCode ? skuStockList.filter(sku => sku.skuCode === checkedSkuCode) : [skuStockList[0]]
    },
    //判断规格是否选择完整
    // isCheckedAllSpec: function() {
    //     return !this.getCheckedSpecValue().some(function(v) {
    //         if (v.valueId == 0) {
    //             return true;
    //         }
    //     });
    // },
    getCheckedSpecKey: function() {
        let checkedValue = this.getCheckedSpecValue().map(function(v) {
            return v.valueId;
        });
        return checkedValue.join('_');
    },
    changeSpecInfo: function() {
        const { skuStockList, checkedSkuCode } = this.data;
        const checkedSku = skuStockList.filter(item => item.skuCode === checkedSkuCode)[0];
        const { skuValue, price, stock } = checkedSku;
        this.setData({
            disabled: '',
            goodsNumber: stock,
            checkedSpecPrice: price,
            tmpSpecText: '已选择：' + skuValue,
            checkedSpecText: '已选择：' + skuValue,
            number: 1
        })
        // 验证库存
        if (!stock) {
            wx.showToast({
                image: '/images/icon/icon_error.png',
                title: '该规格所对应货品不存在',
            });
            return false;
        }
        if (stock < this.data.number) {
            //找不到对应的product信息，提示没有库存
            wx.showToast({
                image: '/images/icon/icon_error.png',
                title: '库存不足',
            });
            return false;
        }

        //     // 点击规格的按钮后
        //     // 验证库存
        //     let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
        //     if (!checkedProductArray || checkedProductArray.length <= 0) {
        //         this.setData({
        //             soldout: true
        //         });
        //         // console.error('规格所对应货品不存在');
        //         wx.showToast({
        //             image: '/images/icon/icon_error.png',
        //             title: '规格所对应货品不存在',
        //         });
        //         return;
        //     }
        //     let checkedProduct = checkedProductArray[0];
        //     if (checkedSku.stock < this.data.number) {
        //         //找不到对应的product信息，提示没有库存
        //         this.setData({
        //             checkedSpecPrice: checkedSku.price,
        //             goodsNumber: checkedSku.stock,
        //             soldout: true
        //         });
        //         wx.showToast({
        //             image: '/images/icon/icon_error.png',
        //             title: '库存不足',
        //         });
        //         return false;
        //     }
        //     if (checkedProduct.stock > 0) {
        //         this.setData({
        //             checkedSpecPrice: checkedProduct.price,
        //             goodsNumber: checkedProduct.stock,
        //             soldout: false
        //         });

        //         var checkedSpecPrice = checkedProduct.price;

        //     } else {
        //         this.setData({
        //             checkedSpecPrice: this.data.goods.price,
        //             soldout: true
        //         });
        //     }
        // } else {
        //     this.setData({
        //         checkedSpecText: '请选择规格和数量',
        //         checkedSpecPrice: this.data.goods.price,
        //         soldout: false
        //     });
        // }
    },
    getCheckedProductItem: function(key) {
        return this.data.productList.filter(function(v) {
            if (v.goods_specification_ids == key) {
                return true;
            } else {
                return false;
            }
        });
    },
    onLoad: function(options) {
        let id = 0;
        var scene = decodeURIComponent(options.scene);
        if (scene != 'undefined') {
            id = scene;
        } else {
            id = options.id;
        }
        this.setData({
            id: id, // 这个是商品id
            valueId: id,
        });
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
        // this.getCartCount();
    },
    onHide:function(){
        this.setData({
            autoplay:false
        })
    },
    getCartCount: function() {
        let that = this;
        util.request(api.CartGoodsCount).then(function(res) {
            if (res.errno === 0) {
                that.setData({
                    cartGoodsCount: res.data.cartTotal.goodsCount
                });
            }
        });
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
            openAttr: false,
            // alone_text: '单独购买'
        });
    },
    goMarketing: function(e) {
        let that = this;
        that.setData({
            showDialog: !this.data.showDialog
        });
    },
    addToCart: function() {
        // 判断是否登录，如果没有登录，则登录
        util.loginNow();
        var that = this;
        let userInfo = wx.getStorageSync('userInfo');
        let skuLength = this.data.skuStockList.length;
        if (userInfo == '') {
            return false;
        }
        if (this.data.openAttr == false && skuLength != 1) {
            //打开规格选择窗口
            this.setData({
                openAttr: !that.data.openAttr
            });
            // this.setData({
            //     alone_text: '加入购物车'
            // })
        } else {
            //提示选择完整规格
            if (!this.checkedSkuCode) {
                wx.showToast({
                    image: '/images/icon/icon_error.png',
                    title: '请选择规格',
                });
                return false;
            }
            //根据选中的规格，判断是否有对应的sku信息
            let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
            if (!checkedProductArray || checkedProductArray.length <= 0) {
                //找不到对应的product信息，提示没有库存
                wx.showToast({
                    image: '/images/icon/icon_error.png',
                    title: '库存不足',
                });
                return false;
            }
            let checkedProduct = checkedProductArray[0];
            //验证库存
            if (checkedProduct.stock < this.data.number) {
                //要买的数量比库存多
                wx.showToast({
                    image: '/images/icon/icon_error.png',
                    title: '库存不足',
                });
                return false;
            }
            wx.showLoading({
              title: '',
              mask:true
            })
            util.request(api.CartAdd, {
                    addType: 0,
                    goodsId: this.data.id,
                    number: this.data.number,
                    productId: checkedProduct.id
                }, "POST")
                .then(function(res) {
                    let _res = res;
                    if (_res.errno == 0) {
                        wx.showToast({
                            title: '添加成功',
                        });
                        if (skuLength != 1 || that.data.openAttr == true) {
                            that.setData({
                                openAttr: !that.data.openAttr,
                                cartGoodsCount: _res.data.cartTotal.goodsCount
                            });
                        } else {
                            that.setData({
                                cartGoodsCount: _res.data.cartTotal.goodsCount
                            });
                        }
                    } else {
                        wx.showToast({
                            image: '/images/icon/icon_error.png',
                            title: _res.errmsg,
                        });
                    }
                    wx.hideLoading()
                });
        }
    },
    fastToCart: function() {
        // 判断是否登录，如果没有登录，则登录
        util.loginNow();
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo == '') {
            return false;
        }
        var that = this;
        if (this.data.openAttr === false) {
            //打开规格选择窗口
            this.setData({
                openAttr: !this.data.openAttr
            });
            // that.setData({
            //     alone_text: '加入购物车'
            // })
        } else {
            //提示选择完整规格
            if (!this.checkedSkuCode) {
                wx.showToast({
                    image: '/images/icon/icon_error.png',
                    title: '请选择规格',
                });
                return false;
            }
            //根据选中的规格，判断是否有对应的sku信息
            let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
            if (!checkedProductArray || checkedProductArray.length <= 0) {
                //找不到对应的product信息，提示没有库存
                wx.showToast({
                    image: '/images/icon/icon_error.png',
                    title: '库存不足',
                });
                return false;
            }
            let checkedProduct = checkedProductArray[0];
            //验证库存
            if (checkedProduct.stock < this.data.number) {
                //要买的数量比库存多
                wx.showToast({
                    image: '/images/icon/icon_error.png',
                    title: '库存不足',
                });
                return false;
            }
            //添加到购物车
            wx.showLoading({
                title: '',
                mask:true
              })
            util.request(api.CartAdd, {
                    addType: 1, // 0：正常加入购物车，1:立即购买，2:再来一单
                    goodsId: this.data.id,
                    number: this.data.number,
                    productId: checkedProduct.id,
                }, "POST")
                .then(function(res) {
                    let _res = res;
                    wx.hideLoading()
                    if (_res.errno == 0) {
                        let id = that.data.id;
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
        this.setData({
            number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
        });
        this.setData({
            disabled: ''
        });
    },
    addNumber: function() {
        this.setData({
            number: Number(this.data.number) + 1
        });
        let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
        let checkedProduct = checkedProductArray;
        var check_number = this.data.number + 1;
        if (checkedProduct.stock < check_number) {
            this.setData({
                disabled: true
            });
        }
    }
})