const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');

//获取应用实例
const app = getApp()

Page({
    data: {
        floorGoods: [],
        openAttr: false,
        showChannel: 0,
        showBanner: 0,
        showBannerImg: 0,
        banner: [],
        index_banner_img: 0,
        userInfo: {},
        imgurl: '',
        sysHeight: 0,
        loading: 0,
        autoplay:true,
        showContact: 0, // 是否展示客服按钮，暂时隐藏
    },
    onPageScroll: function (e) {
        // 滚动显示客服按钮，暂时隐藏
        // let scrollTop = e.scrollTop;
        // let that = this;
        // if (scrollTop >= 2000) {
        //     that.setData({
        //         showContact: 0
        //     })
        // } else {
        //     that.setData({
        //         showContact: 1
        //     })
        // }
    },
    onHide:function(){
        this.setData({
            autoplay:false
        })
    },
    goSearch: function () {
        wx.navigateTo({
            url: '/pages/search/search',
        })
    },
    goCategory: function (e) {
        let id = e.currentTarget.dataset.cateid;
        wx.setStorageSync('categoryId', id);
        wx.switchTab({
            url: '/pages/category/index',
        })
    },
    handleTap: function (event) {
        //阻止冒泡 
    },
    onShareAppMessage: function () {
        let info = wx.getStorageSync('userInfo');
        return {
            title: '海风小店',
            desc: '开源微信小程序商城',
            path: '/pages/index/index?id=' + info.id
        }
    },
    toDetailsTap: function () {
        wx.navigateTo({
            url: '/pages/goods-details/index',
        });
    },
    getIndexData: function () {
        util.request(api.IndexUrl).then((res) => {
            const { data, code } = res;
            if (code === 200) {
                this.setData({
                    // floorGoods: data.categoryList,
                    banner: data.advertiseList,
                    channel: data.channel,
                    // notice: data.notice,
                    loading: 1,
                });
            }
            this.getCartNumber();
        });
    },
    getCartNumber: function () {
        util.request(api.CartList).then((res) => {
            const { data, code } = res;
            if (code === 200) {
                const cartCount = data.length;
                if (cartCount == 0) {
                    wx.removeTabBarBadge({
                        index: 2,
                    })
                } else {
                    wx.setTabBarBadge({
                        index: 2,
                        text: cartCount + ''
                    })
                }
            }
        });
    },
    getProductList: function () {
        let that = this;
        util.request(api.HotProductList).then(res => {
            const { data, code } = res;
            if (code === 200) {
                that.setData({
                    floorGoods: [...that.data.floorGoods, {
                        name: '人气商品',
                        goodsList: data
                    }],
                    loading: 1,
                });
            }
            util.request(api.NewProductList).then(res => {
                const { data, code } = res;
                if (code === 200) {
                    that.setData({
                        floorGoods: [...that.data.floorGoods, {
                            name: '新品推荐',
                            goodsList: data
                        }],
                        loading: 1,
                    });
                }
                util.request(api.RecommendProductList).then(res => {
                    const { data, code } = res;
                    if (code === 200) {
                        that.setData({
                            floorGoods: [...that.data.floorGoods, {
                                name: '个性推荐',
                                goodsList: data
                            }],
                            loading: 1,
                        });
                    }
                })
            })
        })
    },
    onLoad: function (options) {
        // this.getChannelShowInfo();
        this.getIndexData();
        this.getProductList();
    },
    onShow: function () {
        var that = this;
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo != '') {
            that.setData({
                userInfo: userInfo,
            });
        };
        let info = wx.getSystemInfoSync();
        let sysHeight = info.windowHeight - 100;
        this.setData({
            sysHeight: sysHeight,
            autoplay:true
        });
        wx.removeStorageSync('categoryId');
    },
    getChannelShowInfo: function (e) {
        let that = this;
        util.request(api.ShowSettings).then(function (res) {
            if (res.errno === 0) {
                let show_channel = res.data.channel;
                let show_banner = res.data.banner;
                let show_notice = res.data.notice;
                let index_banner_img = res.data.index_banner_img;
                that.setData({
                    show_channel: show_channel,
                    show_banner: show_banner,
                    show_notice: show_notice,
                    index_banner_img: index_banner_img
                });
            }
        });
    },
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        this.getIndexData();
        // this.getChannelShowInfo();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
})