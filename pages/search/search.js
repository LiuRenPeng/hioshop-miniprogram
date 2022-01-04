var util = require('../../utils/util.js');
var api = require('../../config/api.js');

var app = getApp()
Page({
    data: {
        keywrod: '',
        searchStatus: false,
        pageNum: 1,
        pageSize: 10,
        goodsList: [],
        helpKeyword: [],
        historyKeyword: [],
        categoryFilter: false,
        currentSortType: 0, // 0->按相关度；1->按新品；2->按销量；3->价格从低到高；4->价格从高到低
        filterCategory: [],
        defaultKeyword: {},
        hotKeyword: [],
        currentSortOrder: 'desc',
        // salesSortOrder: 0, 
        categoryId: 0,
        loading: true,
        noMore: 0
    },
    //事件处理函数
    closeSearch: function () {
        wx.navigateBack()
    },
    clearKeyword: function () {
        this.setData({
            keyword: '',
            // searchStatus: false
        });
    },
    onLoad: function (options) {
        const { name } = options;
        if (name) {
            this.setData({
                keyword: name,
                // searchStatus: false
            });
            this.getGoodsList();
        }
        // this.getSearchKeyword();
    },
    onShow: function () {
        // this.getGoodsList();
    },
    getSearchKeyword() {
        let that = this;
        util.request(api.SearchIndex).then(function (res) {
            if (res.errno === 0) {
                that.setData({
                    historyKeyword: res.data.historyKeywordList,
                    defaultKeyword: res.data.defaultKeyword,
                    hotKeyword: res.data.hotKeywordList
                });
            }
        });
    },

    inputChange: function (e) {
        this.setData({
            keyword: e.detail.value,
            // searchStatus: false
        });
        this.getGoodsList();
        // this.getHelpKeyword();
    },
    getHelpKeyword: function () {
        let that = this;
        util.request(api.SearchHelper, { keyword: that.data.keyword }).then(function (res) {
            if (res.errno === 0) {
                that.setData({
                    helpKeyword: res.data
                });
            }
        });
    },
    inputFocus: function () {
        // this.setData({
        //     searchStatus: false,
        //     goodsList: []
        // });

        if (this.data.keyword) {
            // this.getHelpKeyword();
        }
    },
    clearHistory: function () {
        this.setData({
            historyKeyword: []
        })

        util.request(api.SearchClearHistory, {}, 'POST')
            .then(function (res) {
            });
    },
    getGoodsList: function () {
        let that = this;
        const { keyword, currentSortType, pageNum, pageSize } = this.data;
        if (keyword) {
            util.request(api.GoodsList, {
                keyword: keyword,
                sort: currentSortType,
                pageNum: pageNum,
                pageSize: pageSize
                // order: that.data.currentSortOrder,
                // sales: that.data.salesSortOrder
            }).then(function (res) {
                const { code, data } = res;
                if (code === 200) {
                    that.setData({
                        searchStatus: true,
                        // categoryFilter: false,
                        goodsList: data.list,
                        noMore: data.totalPage <= pageNum,
                        loading: false
                        // filterCategory: res.data.filterCategory,
                        // page: res.data.currentPage,
                        //   size: res.data.numsPerPage
                    });
                }
                //重新获取关键词
                // that.getSearchKeyword();
            });
        }
    },
    onKeywordTap: function (event) {
        this.getSearchResult(event.target.dataset.keyword);
    },
    getSearchResult(keyword) {
        this.setData({
            keyword: keyword,
            page: 1,
            categoryId: 0,
            goodsList: []
        });

        this.getGoodsList();
    },
    openSortFilter: function (event) {
        let currentId = event.currentTarget.id;
        switch (currentId) {
            // 销量排序
            case 'salesSort':
                // let _SortOrder = 'asc';
                // if (this.data.salesSortOrder == 'asc') {
                //     _SortOrder = 'desc';
                // }
                this.setData({
                    currentSortType: 2, // 'sales',
                    // 'currentSortOrder': 'asc',
                    // 'salesSortOrder': _SortOrder
                });
                this.getGoodsList();
                break;
            case 'priceSort':
                // let tmpSortOrder = 'asc';
                // if (this.data.currentSortOrder == 'asc') {
                //     tmpSortOrder = 'desc';
                // }
                const { currentSortType } = this.data;
                this.setData({
                    currentSortType: currentSortType === 3 ? 4 : 3,
                    // 'currentSortOrder': tmpSortOrder,
                    // 'salesSortOrder': 'asc'
                });
                this.getGoodsList();
                break;
            default:
                //综合排序
                this.setData({
                    currentSortType: 0,
                    // 'currentSortOrder': 'desc',
                    // 'salesSortOrder': 'desc'
                });
                this.getGoodsList();
        }
    },
    onKeywordConfirm(event) {
        this.getSearchResult(event.detail.value);
    },

    //下拉刷新
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        this.getGoodsList();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },

    // 滚动加载下一页
    scrollToLower: function() {
        if (!this.data.noMore) {
            this.setData({
                loading: true,
                pageNum: this.data.pageNum + 1
            });
            this.getGoodsList();
        }
    }
})