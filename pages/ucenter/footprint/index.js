var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

var app = getApp();

Page({
    data: {
        footprintList: [],
        allFootprintList: [],
        pageNum: 1,
        totalPage: 1,
        pageSize: 10,
        hasPrint: 1,
        showNoMore: 1,
    },
    getFootprintList() {
        const { pageSize, pageNum, footprintList } = this.data;
        util.request(api.FootprintList, { pageNum, pageSize }).then((res) => {
            const { code, data } = res;
            if (code === 200) {
                const { list, totalPage } = data;
                this.setData({
                    hasPrint: list && list.length > 0,
                    showNoMore: totalPage === pageNum,
                    footprintList: footprintList.concat(list)
                });
            }
            // wx.hideLoading();
        });
    },
    onLoad: function (options) {
        this.getFootprintList();
    },
    deletePrint: function (e) {
        let id = e.currentTarget.dataset.val;
        util.request(api.FootprintDelete, { ids: [id] }, 'POST', 'query').then((res) => {
            const { code } = res;
            if (code === 200) {
                wx.showToast({
                    title: '移除成功',
                    icon: 'none'
                });
                this.setData({
                    footprintList: [],
                    allFootprintList: [],
                    pageNum: 1,
                    pageSize: 10
                });
                this.getFootprintList();
            }
        });
    },
    toIndexPage: function (e) {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    onReachBottom: function () {
        const { totalPage, pageNum } = this.data;
        if (pageNum === totalPage) {
            this.setData({
                showNoMore: true
            });
            return false;
        }
        this.setData({
            pageNum: pageNum + 1
        });
        this.getFootprintList();
    }
})