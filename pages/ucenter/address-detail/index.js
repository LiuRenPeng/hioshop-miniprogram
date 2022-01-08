var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
const regions = require('../../../utils/chinaRegions.js');
Page({
    data: {
        address: {
            id: 0,
            province: '', // 省
            city: '', // 市
            region: '', // 区（县）
            detailAddress: '', // 详细地址
            postCode: '', // 地区编码
            full_region: '',
            name: '',
            phoneNumber: '',
            defaultStatus: 0
        },
        addressId: '',
        openSelectRegion: false,
        selectRegionList: [{
                name: '省份',
                type: 1
            },{
                name: '城市',
                type: 2
            },{
                name: '区县',
                type: 3
            }
        ],
        regionType: 1, // 当前选中的地区tab
        regionList: [],
        selectRegionDone: false
    },
    mobilechange(e) {
        let phoneNumber = e.detail.value;
        let address = this.data.address;
        if (util.testMobile(phoneNumber)) {
            address.phoneNumber = phoneNumber;
            this.setData({
                address: address
            });
        }
    },
    bindinputName(event) {
        let address = this.data.address;
        address.name = event.detail.value;
        this.setData({
            address: address
        });
    },
    bindinputAddress(event) {
        const { address } = this.data;
        address.detailAddress = event.detail.value;
        this.setData({ address });
    },
    switchChange(e) {
        let defaultStatus = 0;
        if (e.detail.value == true) {
            defaultStatus = 1;
        }
        const { address } = this.data;
        address.defaultStatus = defaultStatus;
        this.setData({ address });
    },
    getAddressDetail(id) {
        util.request(api.AddressDetail, { id }).then((res) => {
            const { code, data } = res;
            if (code === 200) {
                this.setData({
                    address: {
                        ...data,
                        full_region: `${data.province}${data.city}${data.region}`
                    }
                });
            }
        });
    },
    deleteAddress: function() {
        let id = this.data.addressId;
        wx.showModal({
            title: '提示',
            content: '您确定要删除么？',
            success: function(res) {
                if (res.confirm) {
                    util.request(api.DeleteAddress, { id }, 'POST').then(function(res) {
                        if (res.code === 200) {
                            wx.removeStorageSync('addressId');
                            util.showErrorToast('删除成功');
                            wx.navigateBack();
                        } else {
                            util.showErrorToast(res.message);
                        }
                    });
                }
            }
        })
    },
    setRegionDoneStatus() {
        let that = this;
        let doneStatus = that.data.selectRegionList.every(item => {
            return item.id != 0;
        });

        that.setData({
            selectRegionDone: doneStatus
        })

    },
    chooseRegion() {
        const { address, selectRegionList, openSelectRegion } = this.data;
        this.setData({
            openSelectRegion: !openSelectRegion
        });
        //设置区域选择数据
        if (address.province && address.city && address.region) {
            selectRegionList[0].name = address.province;
            selectRegionList[1].name = address.city;
            selectRegionList[2].name = address.region;
            this.setData({
                selectRegionList: selectRegionList,
                regionType: 3
            });
        } else {
            selectRegionList[0].name = '省份';
            selectRegionList[1].name = '城市';
            selectRegionList[2].name = '区县';
            this.setData({
                selectRegionList: selectRegionList,
                regionType: 1
            });
        }
        this.getRegionList();
        this.setRegionDoneStatus();
    },
    onLoad: function(options) {
        // 页面初始化 options为页面跳转所带来的参数
        const { id } = options;
        if (id) {
            this.setData({ addressId: id });
            this.getAddressDetail(id);
        }
    },
    onReady: function() {

    },
    selectRegionType(event) {
        const { regionTypeIndex } = event.target.dataset;
        const { selectRegionList, regionType } = this.data;
        //判断是否可点击
        if (regionTypeIndex + 1 == regionType || (regionTypeIndex - 1 >= 0 && selectRegionList[regionTypeIndex - 1].id <= 0)) {
            return false;
        }
        this.setData({
            regionType: regionTypeIndex + 1
        })
        this.getRegionList();
        this.setRegionDoneStatus();
    },
    // 选中某个城市
    selectRegion(event) {
        const { regionIndex } = event.target.dataset;
        const { regionList, regionType, selectRegionList } = this.data;
        let regionItem = regionList[regionIndex];
        selectRegionList[regionType - 1].name = regionItem.name;
        if(regionType === 1){
            selectRegionList[1].name = '城市';
            selectRegionList[2].name = '区县';
        } else if(regionType === 2) {
            selectRegionList[2].name = '区县';
        }
        this.setData({ 
            selectRegionList,
            regionType: regionType < 3 ? regionType + 1 : regionType
        });
        this.getRegionList();
        this.setRegionDoneStatus();
    },
    doneSelectRegion() {
        const { address, selectRegionList, selectRegionDone } = this.data;
        if (selectRegionDone === false) return false;
        address.province = selectRegionList[0].name;
        address.city = selectRegionList[1].name;
        address.region = selectRegionList[2].name;
        address.full_region = selectRegionList.map(item => {
            return item.name;
        }).join('');
        this.setData({
            address,
            openSelectRegion: false
        });
    },
    cancelSelectRegion() {
        this.setData({
            openSelectRegion: false,
            regionType: this.data.regionDoneStatus ? 3 : 1
        });
    },
    getRegionList() {
        const { regionType, selectRegionList } = this.data;
        let regionList = [];
        if(regionType === 1){
            regionList = regions.map(item => ({
                ...item,
                selected: selectRegionList[0].name === item.name
            }))
        } else if(regionType === 2){
            regionList = regions.find(item => item.name === selectRegionList[0].name).children.map(item => ({
                ...item,
                selected: selectRegionList[1].name === item.name
            }))
        } else {
            regionList = regions.find(item => item.name === selectRegionList[0].name).children
            .find(item => item.name === selectRegionList[1].name).children
            .map(item => ({
                ...item,
                selected: selectRegionList[2].name === item.name
            }))
        }
        this.setData({ regionList });
    },
    saveAddress() {
        const { address } = this.data;
        if (!address.name) {
            util.showErrorToast('请输入姓名');
            return false;
        }
        if (!address.phoneNumber) {
            util.showErrorToast('请输入手机号码');
            return false;
        }
        if (!address.region) {
            util.showErrorToast('请输入省市区');
            return false;
        }
        if (!address.detailAddress) {
            util.showErrorToast('请输入详细地址');
            return false;
        }
        const saveAddressUrl = this.data.addressId ? api.UpdateAddress : api.AddAddress;
        util.request(saveAddressUrl, {
            id: address.id,
            name: address.name,
            phoneNumber: address.phoneNumber,
            province: address.province,
            city: address.city,
            region: address.region,
            detailAddress: address.detailAddress,
            defaultStatus: address.defaultStatus,
        }, 'POST').then((res) => {
            if (res.code === 200) {
                wx.navigateBack()
            }
        });
    },
    onShow: function() {
        const {addressId} = this.data;
        if (addressId) {
            wx.setNavigationBarTitle({
                title: '编辑地址',
            })
        } else {
            wx.setNavigationBarTitle({
                title: '新增地址',
            })
        }
    },
    onHide: function() {
        // 页面隐藏

    },
    onUnload: function() {
        // 页面关闭

    }
})