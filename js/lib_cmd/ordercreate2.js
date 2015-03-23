/**
 * Created by Way on 2015/3/23.
 */

define(function (require, exports, module) {
    var $ = require("lib_cmd/zepto.js"),
        main = require("js_cmd/main.js"),
        balancepay = require("js_cmd/balancepay.js"),
        myDialog = require("lib_cmd/myDialog.js"),
        iTemplate = require("lib_cmd/iTemplate.js"),
        iForm = require("lib_cmd/iForm.js"),
    //
        $eles = {};

    window.onerror = function(e){
        console.log(JSON.stringify(e));
        return true;
    }
    window.addEventListener("pageshow", function(e){
        if(sessionStorage.getItem("cache_orderCreate") ){
            location.reload();
        }
    }, false);

    $(function () {
        //初始化页面元素
        $eles = {
            ordercreate2: $(".ordercreate2"),
            //运送方式
            header_transport_label: $(".header_transport label:nth-of-type(2)"),
            header_transport_arrow: $(".header_transport .arrow"),
            list_transport: $("#list_transport"),
            list_transport_input:[],
            //优惠券
            header_coupon_arrow: $(".header_coupon .arrow"),
            list_coupon: $("#list_coupon"),
            list_coupon_input: $("#list_coupon input"),
            //活动
            header_activity_arrow: $(".header_activity .arrow"),
            list_activity: $("#list_activity"),
            list_activity_input: $("#list_activity input"),
            //红包
            header_redpackage_arrow: $(".header_redpackage .arrow"),
            list_redpackage: $("#list_redpackage"),
            list_redpackage_input: $("#list_redpackage input"),
            list_redpackage_btn:$("#list_redpackage a"),
            //积分
            header_jifen_arrow: $(".header_jifen .arrow"),
            list_jifen: $("#list_jifen"),
            //input_jifen: $(".header_jifen input"),
            list_jifen_input: $("#list_jifen input"),
            list_jifen_btn:$("#list_jifen a"),
            //
            pay_list_input:$("#pay_list input"),
            //
            pay_dialog: $("#pay_dialog")
        }

        initPage();
        fixed_btn().handleEvent();
    });


    function initPage() {
        //transport
        $eles.header_transport_arrow.on("click", function(){
            var on = this.classList.toggle("on");
            $eles.list_transport[on ? "addClass" : "removeClass"]("on");
            if(!$eles.list_transport_input.length){
                var TPL = '<li><label><span>{Name}</span>￥{Fee}<span class="fr"><input type="radio" name="transport" class="radio" value="{index}" {checked_str} /></span></label></li>';
                var list_transport = iTemplate.makeList(TPL, APP.data.transport.list, function (k, v) {
                    return {
                        index: k,
                        checked_str: APP.data.transport.index == k ? 'checked="checked"' : ''
                    }
                });
                $eles.list_transport.html(list_transport);
                $eles.list_transport_input = $eles.list_transport.find("input");
                if(APP.data.transport.list.length){
                    data.delivery = APP.data.transport.list[0];
                }
            }
        });
        $eles.list_transport.on("click", function(evt){
            var et = evt.target, val;
            if("INPUT" == et.tagName && (val = et.value) ){
                APP.data.transport.index = parseInt(val);
                data.delivery = APP.data.transport.list[val];
                $eles.header_transport_arrow.trigger("click");
            }
        });
        //redpackage
        $eles.header_redpackage_arrow.on("click", function () {
            var on = this.classList.toggle("on");
            $eles.list_redpackage[on ? "addClass" : "removeClass"]("on");
        });
        $eles.list_redpackage_btn.on("click", function(){
            var val = $eles.list_redpackage_input.val();
            val = parseFloat(val);
            val = isNaN(val)?0:val;
            if(val>parseFloat(window.data.TotalRedPackageAmount)){
                return;
            }
            window.data.redPackageAmount = Math.max(0, val);
            $eles.header_redpackage_arrow.trigger("click");
        });
        //coupon
        $eles.header_coupon_arrow.on("click", function () {
            var on = this.classList.toggle("on");
            $eles.list_coupon[on ? "addClass" : "removeClass"]("on");
        });
        //select coupon
        $eles.list_coupon_input.on("click", function () {
            $eles.header_coupon_arrow.trigger("click");
            var _coupon = {};
            for(var i=0,ci; ci=window.data.member.Coupons[i]; i++){
                if(this.value == ci.Id){
                    _coupon = ci;
                    break;
                }
            }
            data.coupon = _coupon;
        });
        //activity
        $eles.header_activity_arrow.on("click", function () {
            var on = this.classList.toggle("on");
            $eles.list_activity[on ? "addClass" : "removeClass"]("on");
        });
        //select activity
        $eles.list_activity.on("click", function (evt) {
            var et = evt.target;
            if("INPUT" == et.tagName){
                $eles.header_activity_arrow.trigger("click");
                for(var i=0,ci; ci=APP.data.activitys[i]; i++){
                    if(et.value == ci.Id){
                        window.data.activity = ci;
                        break;
                    }
                }
            }
        });

        //jifen
        $eles.header_jifen_arrow.on("click", function () {
            var on = this.classList.toggle("on");
            $eles.list_jifen[on ? "addClass" : "removeClass"]("on");
        });
        $eles.list_jifen_btn.on("click", function(){
            var val = $eles.list_jifen_input.val();
            val = Math.round(val);
            val = isNaN(val)?0:val;
            if(val>parseInt(window.data.member.Points)){
                return;
            }
            window.data.points = Math.max(0, val);
            $eles.header_jifen_arrow.trigger("click");
        });
        //
        $eles.pay_list_input.on("click", function(){
            for(var i=0,ci; ci=APP.data.paytypes[i]; i++){
                if(this.value == ci.Id){
                    window.data.payment = ci;
                    break;
                }
            }

        });
        // $eles.input_jifen.on("click", function () {

        // });
    }


    window.myChoice = function myChoice(thi, evt, type) {
        switch (type) {
            case "address":
                var form1 = $("#form1")[0],
                    cache = {
                        APP_data: {
                            address: APP.data.address,
                            transport: APP.data.transport,
                            activitys: APP.data.activitys,
                            paytypes: APP.data.paytypes
                        },
                        data: {
                            address: data.address,
                            member: data.member,
                            delivery: data.delivery,
                            list: data.list,
                            coupon: data.coupon,
                            payment: data.payment,
                            businessSet: data.businessSet,
                            pointsAmount: data.pointsAmount,
                            points:data.points,

                            delivery: data.delivery,
                            TotalRedPackageAmount: data.TotalRedPackageAmount,
                            redPackageAmount: data.redPackageAmount,
                            activity:data.activity
                        },
                        remark: form1.remark.value,
                        // coupon: (function(){
                        //     var list_coupon = form1.querySelectorAll("input[name='coupon']");
                        //     for (var i in list_coupon) {
                        //         if (list_coupon[i].checked) {
                        //             return i;
                        //             break;
                        //         }
                        //     }
                        // })(),
                        // paytype: (function () {
                        //     var paytypes = form1.querySelectorAll("input[name='paytype']");
                        //     for (var i in paytypes) {
                        //         if (paytypes[i].checked) {
                        //             return i;
                        //             break;
                        //         }
                        //     }
                        // })(),
                        time: +new Date()
                    }
                sessionStorage.setItem("cache_orderCreate", JSON.stringify(cache));
                break;
            case "transport"://
                break;
            case "paytype"://
                break;
            default:
                break;
        }
    }

    window.createOrder = function createOrder(orderType) {
        var remark = $("#remark").val();
        window.data.createOrder(APP.urls.createOrder_url, orderType, APP.buyFrom, remark, function (payment, payAmount, data, orderType) {
            $(".order_no").html(data.OrderNo);
            //说明是积分全额支付
            if (payAmount == 0) {
                location.href = data.Url;
            }
            else if (orderType == 2) {
                location.href = APP.urls.wishPay_page + "?id=" + data.CrowdfundingId;
            }
            else if (payment.Name.indexOf("余额") > 0) {
                this.t.destroy();
                var d = new Date();
                d = [d.getFullYear(), ("0" + (d.getMonth() + 1)).slice(-2), ("0" + d.getDate()).slice(-2)].join("-");
                Balancepay(null, null, data.OrderId, data.OrderNo, window.data.payAmount, d);
            }
            else {
                location.href = data.Url;
            }
        }, function (msg) {
            alert(msg);
        });
    }


    window.Balancepay = function (thi, evt, orderId, orderNo, BalanceAmount, OrderTime) { //余额支付
        new balancepay(orderId, orderNo, BalanceAmount, OrderTime).open().config({
            balancecharge_page: APP.urls.balancecharge_page,
            balancepay_url: APP.urls.balancepay_url,
            onPaySuccess: function (res) {
                if (res.Status == 0) {
                    alert(res.Message);
                    location.href = res.Data;
                }else if (3 == res.Status) {
                    window.Balancepay(thi, evt, orderId, orderNo, BalanceAmount, OrderTime, 2);
                }else {
                    var msg = "余额支付失败";
                    if (res.Status == 2)
                        msg = res.Message;
                    alert(msg);
                }
            }
        });
    }


    //
    function fixed_btn(){
        var Obj = {
            submit_btn1: $("#order_submit_1 .btn")[0],
            //buy_btn2:document.getElementById("buy_btn2"),
            order_submit_2_ul: $("#order_submit_2 ul")[0],
            doc_height: Math.min(document.body.clientHeight, document.documentElement.clientHeight),

            handleEvent: function () {
                var that = this;
                var range = that.submit_btn1.offsetTop - document.body.scrollTop;
                var outRange = "true";
                if (that.order_submit_2_ul) {
                    if (range < that.doc_height + 50 && range > -50) {
                        outRange = false;
                        that.order_submit_2_ul.removeAttribute("style");
                    } else {
                        outRange = true;
                        that.order_submit_2_ul.setAttribute("style", "position:fixed;");
                    }
                }
            }
        }
        window.addEventListener("scroll", Obj, false);
        return Obj;
    };

    function AppData() {
        AppData.instance = this;
        var businessSet = null;//商户配置
        var member = null;//会员
        var coupon = null;//优惠券
        var delivery = null;//配送方式
        var address = null;//收货地址
        var list = null;//商品列表
        var points = 0;//积分
        var payment = null;//支付方式
        var pointsAmount = 0;//积分金额
        var memberPointsAmount = 0;//会员的积分能兑换的金额
        var couponAmount = 0;//优惠券金额
        var deliveryFee = 0;//运费
        var totalAmount = 0;//总金额
        var payAmount = 0;//需支付金额
        var orderId;//订单ID
        var orderNo;//订单编号
        var prePayment;//前一个支付方式
        var redPackageAmount = 0 ;//红包金额
        var activity = null;//参与的活动
        var activityAmount = 0 ;//活动金额

        Object.defineProperty(this, "coupon", {
            get: function () { return coupon; },
            set: function (value) {
                var that = this;
                coupon = value;
                if(coupon){
                    coupon.Id = coupon.Id||"0"; //不使用优惠券
                    $eles.header_coupon_arrow.find("label").eq(1).html(coupon.Name||"不使用优惠券" );
                    for(var i=0,ci; ci = $eles.list_coupon_input[i]; i++){
                        if(ci.value == coupon.Id){
                            ci.checked = true;
                            ci.setAttribute("checked", "checked");
                        }else{
                            ci.checked = false;
                            ci.removeAttribute("checked");
                        }
                    }
                }
                if (showAmount) {
                    showAmount(that.payAmount, that.deliveryFee, that.pointsAmount, that.points);
                }
            }
        });

        Object.defineProperty(this, "orderId", {
            get: function () { return orderId; },
            set: function (value) {
                orderId = value;
            }
        });

        Object.defineProperty(this, "orderNo", {
            get: function () { return orderNo; },
            set: function (value) {
                orderNo = value;
            }
        });

        Object.defineProperty(this, "address", {
            get: function () { return address; },
            set: function (value) {
                var that = this;
                if (!address || JSON.stringify(address) != JSON.stringify(value) ) {
                    address = value;
                    address&&validActivityGabalnara.call(this);
                    if (addressChange) {
                        addressChange(address, that.list)
                    }
                    if (showAmount) {
                        showAmount(that.payAmount, that.deliveryFee, that.pointsAmount, that.points);
                    }
                }
                //显示当前地址
                var address_url = APP.urls.my_address_page;
                if (address&&address.address_id) {
                    address_url += "&addid=" + address.address_id;
                }
                var TPL = '<a href="' + address_url + '" class="tbox arrow" onclick="myChoice(this, event, \'address\');">\
                            <div>\
                            <span class="icon_wrap icon_address">&nbsp;</span>\
                            </div>\
                            <div>\
                            <p><span><label>收货人：</label>{receiver}</span><span class="fr">{phone}</span></p>\
                            <p>{FullAddress}</p>\
                            </div>\
                        </a>';
                if (!address||!address.address_id) {
                    TPL = '<a href="' + APP.urls.my_address_page + '" class="tbox arrow" onclick="myChoice(this, event, \'address\');">\
                            <div>\
                            <span class="icon_wrap icon_address">&nbsp;</span>\
                            </div>\
                            <div>\
                            <p>暂无收货地址</p>\
                            </div>\
                        </a>';
                }
                //_alert(address);
                $("#wrap_address").html(iTemplate.makeList(TPL, [address]));
            }
        });

        Object.defineProperty(this, "member", {
            get: function () { return member; },
            set: function (value) {
                member = value;
            }
        });

        Object.defineProperty(this, "memberPointsAmount", {
            get: function () {
                var that = this;
                return (that.member || { Points: 0 }).Points / (that.businessSet.VipPoints == 0 ? 100 : that.businessSet.VipPoints);
            }
        });

        Object.defineProperty(this, "points", {
            get: function () {
                return points;
            },
            set: function(value){
                points = Math.min(value, this.member.Points);
                if(this.businessSet && this.businessSet.PerBillOfPoints){
                    points = Math.min(points, parseInt(this.businessSet.PerBillOfPoints) );
                }
                this.pointsAmount = (points/this.businessSet.VipPoints);
            }
        });

        Object.defineProperty(this, "list", {
            get: function () { return list; },
            set: function (value) {
                var that = this;
                list = value;
                if (showAmount) {
                    showAmount(that.payAmount, that.deliveryFee, that.pointsAmount, that.points);
                }
            }
        });

        Object.defineProperty(this, "delivery", {
            get: function () { return delivery; },
            set: function (value) {
                var that = this;
                delivery = value;
                if(delivery){
                    $eles.header_transport_label.html(delivery.Name + (delivery.Fee?("￥" + delivery.Fee):"" ) )
                    for(var i=0,ci; ci = $eles.list_transport_input[i]; i++){
                        if(ci.value == APP.data.transport.index){
                            ci.checked = true;
                            ci.setAttribute("checked", "checked");
                        }else{
                            ci.checked = false;
                            ci.removeAttribute("checked");
                        }
                    }
                }
                if (that.pointsAmount > 0)
                    that.pointsAmount = Math.round((that.memberPointsAmount > that.totalAmount - that.couponAmount ? that.totalAmount - that.couponAmount : that.memberPointsAmount) * 100) / 100;
                if (showAmount) {
                    showAmount(that.payAmount, that.deliveryFee, that.pointsAmount, that.points);
                }
            }
        });

        Object.defineProperty(this, "payment", {
            get: function () { return payment; },
            set: function (value) {
                var that = this;
                payment = value;
                //if (!that.prePayment)
                payment = value;
                if(payment){
                    for(var i=0,ci; ci = $eles.pay_list_input[i]; i++){
                        if(ci.value == payment.Id){
                            ci.checked = true;
                            ci.setAttribute("checked", "checked");
                            if(i>0){
                                $("#pay_list").addClass("on");
                            }
                        }else{
                            ci.checked = false;
                            ci.removeAttribute("checked");
                        }
                    }
                }
                if (showAmount) {
                    showAmount(that.payAmount, that.deliveryFee, that.pointsAmount, that.points);
                }
            }
        });

        Object.defineProperty(this, "businessSet", {
            get: function () { return businessSet; },
            set: function (value) { businessSet = value; }
        });

        Object.defineProperty(this, "showAmount", {
            get: function () { return showAmount; },
            set: function (value) { showAmount = value; }
        });

        Object.defineProperty(this, "pointsAmount", {
            get: function () {
                return parseFloat(pointsAmount);
            },
            set: function (value) {
                var that = this;
                if(that.businessSet && that.businessSet.IsVipPoint){
                    pointsAmount = value.toFixed(2);
                    var _Points = Math.min(that.member.Points, that.businessSet.PerBillOfPoints||0);
                    $eles.header_jifen_arrow.find("label.fr").html(value?'已使用'+that.points+'积分抵扣'+pointsAmount+'元':'可使用'+_Points+'积分抵扣'+(_Points/that.businessSet.VipPoints).toFixed(2)+'元');
                    $eles.list_jifen_input.val(that.points);
                }else{
                    pointsAmount = 0;
                }
                if (showAmount) {
                    showAmount(that.payAmount, that.deliveryFee, that.pointsAmount, that.points)
                }
            }
        });

        Object.defineProperty(this, "couponAmount", {
            get: function () {
                var that = this;
                if (coupon && coupon.Id && 0!=coupon.Id && that.businessSet && that.businessSet.IsCoupon)
                    return Math.floor((that.totalAmount - that.deliveryFee) / (coupon || { UseAmount: 1, DiscountAmount: 0 }).UseAmount >= 1 ? 1 : 0) * (coupon || { UseAmount: 1, DiscountAmount: 0 }).DiscountAmount;
                else
                    return 0;
            }
        });
        Object.defineProperty(this, "payAmount", {
            get: function () {
                var that = this;
                return Math.round((that.totalAmount - that.pointsAmount - that.couponAmount - that.redPackageAmount - that.activityAmount) * 100) / 100;
            }
        });

        Object.defineProperty(this, "totalAmount", {
            get: function () {
                var that = this;
                var total = 0;
                try {
                    [].forEach.call(list, function (v, k) {
                        total += v.MemberPrice * v.Count;
                    });
                } catch (ex) {
                    console.log(ex);
                    total = 0;
                }
                if (!that.member)
                    that.member = { Discount: 100, IsVipPoint: false, Points: 0 };
                return Math.round(total * 100) / 100 + that.deliveryFee;
            }
        });

        Object.defineProperty(this, "deliveryFee", {
            get: function () {
                return (delivery || { Fee: 0 }).Fee;
            }
        });
        Object.defineProperty(this, "payAmountEqualsZero", {
            get: function () { return payAmountEqualsZero; },
            set: function (value) { payAmountEqualsZero = value; }
        });

        Object.defineProperty(this, "addressChange",
            {
                get: function () { return addressChange; },
                set: function (value) { addressChange = value; }
            });
        Object.defineProperty(this, "listChange",
            {
                get: function () { return listChange; },
                set: function (value) { listChange = value; }
            });

        Object.defineProperty(this, "redPackageAmount", {
            get: function () { return redPackageAmount||0; },
            set: function (value) {
                var that = this;
                redPackageAmount = Math.round(parseFloat(value)*100)/100;
                if(this.businessSet && this.businessSet.PerBillOfRedPackage){
                    redPackageAmount = Math.min(redPackageAmount, parseFloat(this.businessSet.PerBillOfRedPackage) );
                }
                $eles.header_redpackage_arrow.find("label.fr").html(redPackageAmount?'已使用￥'+redPackageAmount.toFixed(2):'可用￥'+this.TotalRedPackageAmount.toFixed(2));
                $eles.list_redpackage_input.val(redPackageAmount);
                if (showAmount) {
                    showAmount(that.payAmount, that.deliveryFee, that.pointsAmount, that.points);
                }
            }
        });

        //选中的活动
        Object.defineProperty(this, "activity", {
            get: function () { return activity; },
            set: function(value){
                var that = this;
                activity = value;
                if(activity){
                    $eles.header_activity_arrow.find("label.fr").html(activity.Desc);
                    for(var i=0, ci; ci = $eles.list_activity_input[i]; i++){
                        if(activity.Id == ci.value){
                            ci.checked = true;
                            ci.setAttribute("checked", "checked");
                        }else{
                            ci.checked = false;
                            ci.removeAttribute("checked");
                        }
                    }
                    that.activityAmount = activity.Amount;
                }
                $("#activity_ads").css("display", activity&&activity.Id?"inherit":"none");
            }
        });
        //活动金额
        Object.defineProperty(this, "activityAmount", {
            get: function () {
                return activityAmount;
            },
            set: function (value) {
                var that = this;
                var _IsGabalnara = false;
                activityAmount = value;
                //根据活动所包含的商品，和地区判断是否免邮费
                if(that.activity){
                    //验证所有商品
                    var products_gabalnara = [], products_ungabalnara = [], _list = [];
                    if(that.activity.inGabalnara){
                        //计算哪些商品包邮
                        for(var i=0, ci, flag = 0; ci = that.list[i]; i++){
                            //此商品参加了免运费活动
                            if(that.activity.ProductIds.indexOf(ci.ProductId)>-1){
                                flag++;
                            }
                            (flag?products_gabalnara:products_ungabalnara).push(ci.ProductId);
                            _IsGabalnara = products_gabalnara.length>0;
                        }
                        for(var i=0, ci; ci = that.list[i]; i++){
                            if(products_ungabalnara.indexOf(ci.ProductId)>-1 ){
                                _list.push(ci);
                            }
                        }
                    }else{
                        _list = that.list;
                    }

                    that.listChange && that.listChange(that.address, _list, function(){
                        console.log("--------------包邮计算邮费----------------");
                        activity.deliveryFee = that.deliveryFee;
                    });


                }
                var _Title = [];
                if(activity.Title && activity.Title.length){
                    _Title.push(activity.Title);
                }
                if(_IsGabalnara || (0 == activity.Amount)){
                    _Title.push('包邮');
                }
                $("#activity_ads").html('<li><label class="activity_ads_tag">'+activity.Name+'</label></li><li><label class="activity_ads_content">'+_Title.join("，")+'</label></li>');
            }
        });

        //用于显示支付金额
        var showAmount;
        //当全部用积分支付时对前页面的控制
        var payAmountEqualsZero;
        //当地址变化时触发的获取配送方式
        var addressChange;
        var listChange;
        this.createOrder = function (url, orderType, buyFrom, remark, success, fail) {
            var that = this;
            if (!that.address || !that.address.address_id) {
                tip("收货地址不能为空~", { classes: "otip" });
                return false;
            }
            if (orderType == 1) {
                if (that.payAmount > 0 && (!that.payment || that.payment.Id == null || that.payment.Id == 0)) {
                    tip("支付方式不能为空~", { classes: "otip" });
                    return false;
                }
            }
            else if (orderType == 2) {
                that.payment = null;
            }
            if(!navigator.onLine){
                tip("当前网络不给力哦~", { classes: "otip" });
                return;
            }
            var t = tip("订单提交中...", { classes: "otip", t: 1000 * 60 * 3 });
            $.ajax({
                type: "POST",
                url: url,
                timeout: 30000,
                data: {
                    "address": JSON.stringify(that.address),
                    "businessSetId": that.businessSet.Id,
                    "member": JSON.stringify(that.member),
                    "coupon": JSON.stringify(that.coupon),
                    "payment": JSON.stringify(that.payment),
                    "items": JSON.stringify(that.list),
                    "delivery": JSON.stringify(that.delivery),
                    "remark": remark,
                    "points": that.points,
                    "pointsAmount": that.pointsAmount,
                    "payAmount": that.payAmount,
                    "couponAmount": that.couponAmount,
                    "buyFrom": buyFrom,
                    "orderType": orderType,
                    "redPackageAmount":redPackageAmount,
                    "activity":JSON.stringify(activity),
                    "activityAmount":activityAmount
                },
                async: false,
                success: function (res) {
                    if (res.Status == 0) {
                        that.orderId = res.Data.OrderId;
                        that.orderNo = res.Data.OrderNo;
                        success.call({ t: t }, that.payment, that.payAmount, res.Data, orderType);

                    }
                    else {
                        t.destroy();
                        //后台指定错误
                        if (res.Status == 2) {
                            tip(res.Message, { classes: "otip" });
                        } else {
                            //1:常规错误 或者 库存不足
                            if (res.Status == 1 || res.Status ==4) {
                                alert(res.Message, {
                                    TPL: '<div class="widget_wrap" style="z-index:{zIndex};">\
											<div class="widget_header"></div>\
											<div class="widget_body">{str}</div>\
											<div class="widget_footer">\
												<ul>\
													<li><a href="'+ APP.urls.home_page + '" class="button" data-btn="1">返回首页</a></li>\
												</ul>\
											</div>\
										</div>'
                                });
                            } else if (res.Status == 3) {
                                //订单提交失败
                                confirm(res.Message, {
                                    TPL: '<div class="widget_wrap" style="z-index:{zIndex};">\
											<div class="widget_header"></div>\
											<div class="widget_body">{str}</div>\
											<div class="widget_footer">\
												<ul>\
													<li><a href="javascript:;" class="button" data-btn="0">重新提交</a></li>\
													<li><a href="'+ APP.urls.home_page + '" class="button" data-btn="1">返回首页</a></li>\
												</ul>\
											</div>\
										</div>',
                                    callBack: function (evt) {
                                        var et = evt.target;
                                        if ("重新提交" == et.innerText) {
                                            //createOrder(1);
                                            this.destroy();
                                        }
                                    }
                                });
                            }
                        }

                    }
                },
                dataType: "json"
            })
        }
    }


    //根据地址验证活动是否免运费
    function validActivityGabalnara() {
        var that = this,
            reg = new RegExp("(" + [that.address.province_id, that.address.city_id, that.address.address_id].join(")|(") + ")", "gi"),
            flag = false,
            ac_valid_len = 0;
        var arr=[that.address.province_id, that.address.city_id, that.address.address_id];
        for (var i = APP.data.activitys.length - 1, ci, default_checed = false; ci = APP.data.activitys[i]; i--) {
            flag = checkArr(ci.AreaIds, arr);
            ci.inGabalnara = ci.IsGabalnara && (flag || 0 == ci.AreaIds.length);
            default_checed = default_checed || (that.activity && that.activity.Id == ci.Id) || (0 == i);
            ci.checked = default_checed;
        }
        var TPL = ' <li {hidden_str}>\
                    <label>\
                        {Name}<span class="fr">优惠{Amount}{Gabalnara_str}&nbsp;<input type="radio" name="activity" class="radio" value="{Id}" {checked_str} ></span>\
                    </label>\
                </li>', HTML = '';
        HTML = iTemplate.makeList(TPL, APP.data.activitys, function (k, v, fee) {
            fee = (0 == v.Amount && !v.inGabalnara);
            ac_valid_len += fee ? 0 : 1;
            return {
                hidden_str: fee ? 'style="display:none;"' : '',
                Amount: v.Amount.toFixed(2),
                checked_str: v.checked ? 'checked="checked"' : '',
                Gabalnara_str: v.inGabalnara ? ',包邮' : ''
            }
        });
        $eles.list_activity.html(HTML)[ac_valid_len ? "removeClass" : "addClass"]("hidden");
        $eles.header_activity_arrow.parent()[ac_valid_len ? "removeClass" : "addClass"]("hidden");
    }

    function checkArr(arr1, arr2) {
        for(var i=0;i<arr1.length;i++)
        {
            for (var j = 0; j < arr2.length; j++) {
                if (arr1[i] == arr2[j])
                    return true;
            }
        }
        return false;
    }


    //
    module.exports = {
        $: $,
        main: main,
        balancepay: balancepay,
        myDialog: myDialog,
        iTemplate: iTemplate,
        iForm: iForm,
        AppData: AppData,
        $eles:$eles
    }
});