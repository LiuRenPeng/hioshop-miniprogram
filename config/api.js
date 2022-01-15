const ApiRootUrl = 'http://portal.cross-board-mall.demo';

module.exports = {
    // 登录
    AuthLoginByWeixin: ApiRootUrl + '/sso/login', //微信登录
    // 首页
    IndexUrl: ApiRootUrl + '/home/content', //首页数据接口
    HotProductList: ApiRootUrl +  '/home/hotProductList',  //人气推荐商品
    NewProductList: ApiRootUrl + '/home/newProductList', // 新品推荐商品
    RecommendProductList: ApiRootUrl + '/home/recommendProductList', // 推荐商品
    // 分类
    CategoryList: ApiRootUrl + '/product/categoryTreeList', //分类目录全部分类数据接口
    CatalogCurrent: ApiRootUrl + 'catalog/current', //分类目录当前分类数据接口
    GetCurrentList: ApiRootUrl + 'catalog/currentlist',
    // 购物车
    CartAdd: ApiRootUrl + '/cart/add', // 添加商品到购物车
    CartList: ApiRootUrl + '/cart/list', //获取购物车的数据
    CartUpdateNumber: ApiRootUrl + '/cart/update/quantity', // 更新购物车的商品数量
    CartDelete: ApiRootUrl + '/cart/delete', // 删除购物车的商品
    CartChecked: ApiRootUrl + 'cart/checked', // 选择或取消选择商品
    CartGoodsCount: ApiRootUrl + 'cart/goodsCount', // 获取购物车商品件数
    CartCheckout: ApiRootUrl + '/order/generateConfirmOrder', // 从购物车生成确认订单
    // 商品
    GoodsCount: ApiRootUrl + 'goods/count', //统计商品总数
    GoodsDetail: ApiRootUrl + '/product/detail/{id}', //获得商品的详情
    GoodsList: ApiRootUrl + '/product/search', //获得商品列表
    GoodsShare: ApiRootUrl + 'goods/goodsShare', //获得商品的详情
    SaveUserId: ApiRootUrl + 'goods/saveUserId',
    // 收货地址
    AddressDetail: ApiRootUrl + '/member/address/{id}', //收货地址详情
    DeleteAddress: ApiRootUrl + '/member/address/delete/{id}', //删除收货地址
    UpdateAddress: ApiRootUrl + '/member/address/update/{id}', //更新收货地址
    AddAddress: ApiRootUrl + '/member/address/add', //添加收货地址
    GetAddresses: ApiRootUrl + '/member/address/list', // 查询收货地址列表
    RegionList: ApiRootUrl + 'region/list', //获取区域列表
    // 订单
    PayPrepayId: ApiRootUrl + 'pay/preWeixinPay', //获取微信统一下单prepay_id
    OrderSubmit: ApiRootUrl + '/order/generateOrder', // 提交订单
    OrderList: ApiRootUrl + '/order/list', //订单列表
    OrderDetail: ApiRootUrl + '/order/detail/{orderId}', //订单详情
    OrderDelete: ApiRootUrl + '/order/deleteOrder', //订单删除
    OrderCancel: ApiRootUrl + '/order/cancelUserOrder', //取消订单
    OrderConfirm: ApiRootUrl + 'order/confirm', //物流详情
    // OrderCount: ApiRootUrl + 'order/count', // 获取订单数
    OrderCountInfo: ApiRootUrl + 'order/orderCount', // 我的页面获取订单数状态
    OrderExpressInfo: ApiRootUrl + 'order/express', //物流信息
    OrderGoods: ApiRootUrl + 'order/orderGoods', // 获取checkout页面的商品列表
    // 足迹
    FootprintCreate: ApiRootUrl + '/member/readHistory/create', // 创建浏览记录
    FootprintList: ApiRootUrl + '/member/readHistory/list', //足迹列表
    FootprintDelete: ApiRootUrl + '/member/readHistory/delete', //删除足迹
    // 搜索
    SearchIndex: ApiRootUrl + 'search/index', //搜索页面数据
    SearchHelper: ApiRootUrl + 'search/helper', //搜索帮助
    SearchClearHistory: ApiRootUrl + 'search/clearHistory', //搜索帮助
    ShowSettings: ApiRootUrl + 'settings/showSettings',
    SaveSettings: ApiRootUrl + 'settings/save',
    SettingsDetail: ApiRootUrl + 'settings/userDetail',
    GetBase64: ApiRootUrl + 'qrcode/getBase64', //获取商品详情二维码

};