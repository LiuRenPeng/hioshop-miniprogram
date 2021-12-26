var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
    data: {
        navList: [],
        categoryList: [],
        currentCategory: {},
        // goodsCount: 0,
        selectedId: 0,
        secondNavList: [],
        allPage: 1,
        allCount: 0,
        size: 8,
        hasInfo: 0,
        showNoMore: 0,
        loading:0,
        index_banner_img:0,
    },
    onLoad: function(options) {
    },
    getChannelShowInfo: function (e) {
        let that = this;
        util.request(api.ShowSettings).then(function (res) {
            if (res.errno === 0) {
                let index_banner_img = res.data.index_banner_img;
                that.setData({
                    index_banner_img: index_banner_img
                });
            }
        });
    },
    onPullDownRefresh: function() {
        wx.showNavigationBarLoading()
        this.getCategoryList();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    getCategoryList: function() {
        //CatalogList
        let that = this;
        util.request(api.CategoryList).then(function(res) {
            console.log(res);
            const { code, data } = res;
            if(code == 200) {
                that.setData({
                    navList: data,
                    loading: 0,
                    selectedId: data[0].id,
                    secondNavList: data[0].children
                });
            }
        });
        // util.request(api.GoodsCount).then(function(res) {
        //     that.setData({
        //         goodsCount: res.data.goodsCount
        //     });
        // });
    },
    // getCurrentCategory: function(id) {
    //     let that = this;
    //     util.request(api.CatalogCurrent, {
    //         id: id
    //     }).then(function(res) {
    //         that.setData({
    //             currentCategory: res.data
    //         });
    //     });
    // },
    getCurrentList: function(id) {
        let that = this;
        util.request(api.GetCurrentList, {
            size: that.data.size,
            page: that.data.allPage,
            id: id
        }, 'POST').then(function(res) {
            if (res.errno === 0) {
                let count = res.data.count;
                that.setData({
                    allCount: count,
                    allPage: res.data.currentPage,
                    list: that.data.list.concat(res.data.data),
                    showNoMore: 1,
                    loading: 0,
                });
                if (count == 0) {
                    that.setData({
                        hasInfo: 0,
                        showNoMore: 0
                    });
                }
            }
        });
    },
    onShow: function() {
        // this.getChannelShowInfo();
        // let id = this.data.selectedId;
        // let selectedId = wx.getStorageSync('categoryId');
        // if(id == 0 && selectedId === 0){
        //     return false
        // }
        // else if (selectedId == 0 && selectedId === '') {
        //     this.setData({
        //         list: [],
        //         allPage: 1,
        //         allCount: 0,
        //         size: 8,
        //         loading: 1
        //     })
        //     this.getCurrentList(0);
        //     this.setData({
        //         selectedId: 0,
        //         currentCategory: {}
        //     })
        //     wx.setStorageSync('categoryId', 0)
        // } else if(id != selectedId) {
        //     this.setData({
        //         list: [],
        //         allPage: 1,
        //         allCount: 0,
        //         size: 8,
        //         loading: 1
        //     })
        //     this.getCurrentList(selectedId);
        //     this.getCurrentCategory(selectedId);
        //     this.setData({
        //         selectedId: selectedId
        //     })
        //     wx.setStorageSync('categoryId', selectedId)
        // }
        
        this.getCategoryList();
    },
    // 点击一级类目
    switchCate: function(e) {
        let id = e.currentTarget.dataset.id;
        // let selectedId = this.data.selectedId;
        // if (id == selectedId) {
        //     return false;
        // } else {
        //     this.setData({
        //         list: [],
        //         allPage: 1,
        //         allCount: 0,
        //         size: 8,
        //         loading: 1
        //     })
        //     if (id == 0) {
        //         this.getCurrentList(0);
        //         this.setData({
        //             currentCategory: {}
        //         })
        //     } else {
        //         wx.setStorageSync('categoryId', id)
        //         this.getCurrentList(id);
        //         this.getCurrentCategory(id);
        //     }
            wx.setStorageSync('categoryId', id)
            this.setData({
                selectedId: id,
                secondNavList: this.data.navList.find(nav => nav.id === id).children
            })
        // }
    },
    onBottom: function() {
        let that = this;
        if (that.data.allCount / that.data.size < that.data.allPage) {
            that.setData({
                showNoMore: 0
            });
            return false;
        }
        that.setData({
            allPage: that.data.allPage + 1
        });
        let selectedId = that.data.selectedId;
        if (selectedId == 0 || selectedId == undefined) {
            that.getCurrentList(0);
        } else {
            that.getCurrentList(selectedId);
        }
    }
})