const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');
//获取应用实例
const app = getApp()

Page({
    data: {

    },
    onLoad: function (options) {

    },
    onShow: function () {
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo != '') {
            wx.navigateBack();
        };
    },
    // getUserInfo: function (e) {
    //     app.globalData.userInfo = e.detail.userInfo
    //     user.loginByWeixin().then(res => {
    //         app.globalData.userInfo = res.data.userInfo;
    //         app.globalData.token = res.data.token;
    //         let is_new = res.data.is_new;//服务器返回的数据；
    //         if (is_new == 0) {
    //             util.showErrorToast('您已经是老用户啦！');
    //             wx.navigateBack();
    //         }
    //         else if (is_new == 1) {
    //             wx.navigateBack();
    //         }

    //     }).catch((err) => { });
    // },

    getUserProfile: function () {
        // wx.navigateTo({
        //     url: '/pages/app-auth/index',
        // });
        let that = this;
        let code = '';
        wx.login({
            success: (res) => {
                code = res.code;
            },
        });
        // 获取用户信息
        wx.getUserProfile({
            lang: 'zh_CN',
            desc: '用户登录',
            success: (res) => {
                let loginParams = {
                    code: code,
                    encryptedData: res.encryptedData,
                    iv: res.iv,
                    rawData: res.rawData,
                    signature: res.signature
                };
                console.log(loginParams);
                that.postLogin(loginParams);
            },
            // 失败回调
            fail: () => {
                // 弹出错误
                App.showError('已拒绝小程序获取信息');
            }
        });
    },
    postLogin(info) {
        console.log('获取用户信息：', info);
        /**
         * code: "053GU3100pbMZM17Y4200VnTXf0GU31w"
         * encryptedData: "cSCtUvhU+hpT1hdLWTRb7QHfr973F944qJSrAWy7sCrYYItynntEsFYwPqmDf0cq7cdC28GMRK2rCDWt0Rkq6PvGWViRXfJUwOU7tQE9NdFguUY+U0Ajp++HmbBjqGvVc2a8nupthDyNlueRSKqp3iG2dX4rNKrXp1ajrljIvBqPbD4OypfTU/VHfIle2Z8kj02PRNB8Wb3zeI+teSyAhMwg6ZnGdj1QcKGnQd+0mLoR1AIR8Btj+jO1543PAzn81cqxwWBiZcT3lPRujdxX+ud1V2OxEzpP/tVCMIdfQJR1eGbbIxFaHc58f+fSAlxqYe+L1dJiogH1nWuBRuqcjrqP6Twl6G/4IIJraMAhvSVmcCiMUmeG4NMsNYFk99jKWz7dGC9+xtITgifUXsQILb0ubt7SqMknKDlCkUTaT8Q="
         * iv: "7YrBTA/yaNajsjvV15T5Fg=="
         * rawData: "{"nickName":"白砂糖的白","gender":0,"language":"zh_CN","city":"","province":"","country":"","avatarUrl":"https://thirdwx.qlogo.cn/mmopen/vi_32/2IREcf6AoqRoZiadicUbStib4TuehK8EnuxicUaHqvZCiblRqusw7FITDHP8lp3IcqZZdJNhu10oVbNfYz0rOClmpsA/132"}"
         * signature: "6fcb61c466f3998e06b7166eb3d7aa8f0e778ff8"
         */

        util.request(api.AuthLoginByWeixin, {
            // info: info
            username: 'test',
            password: 'abc123'
        }, 'POST').then(function (res) {
            console.log('------userlogin',res);
            if (res.errno === 0) {
                wx.setStorageSync('userInfo', res.data.userInfo);
                wx.setStorageSync('token', res.data.token);
                app.globalData.userInfo = res.data.userInfo;
                app.globalData.token = res.data.token;
                let is_new = res.data.is_new; //服务器返回的数据；
                console.log(is_new);
                if (is_new == 0) {
                    util.showErrorToast('您已经是老用户啦！');
                    wx.navigateBack();
                } else if (is_new == 1) {
                    wx.navigateBack();
                }
            }
        }).catch(() => {
            console.log('登录接口请求失败，用模拟账号token')
            const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0IiwiY3JlYXRlZCI6MTY0MTYyNjQxNDM3NywiZXhwIjoxNjQyMjMxMjE0fQ.TOFiHfeh9jllJp8JuSa9nPOdhAcM5IsN1qNWTiYpxFexcGJynqb5oQSnfVOs47L-Bmik6fgFCiGP0QutIducPQ";
            const userInfo = JSON.parse(info.rawData);
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('token', token);
            app.globalData.userInfo = userInfo;
            app.globalData.token = token;
            wx.navigateBack();
        });
    },
    goBack: function () {
        wx.navigateBack();
    }
})