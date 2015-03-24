/**
 * Created by Way on 2015/3/23.
 */

define(function(require, exporets, module){
    var $ = require("lib_cmd/zepto.js"),
        myDialog = require("lib_cmd/myDialog.js"),
        iForm = require("lib_cmd/iForm.js"),
        iTemplate = require("lib_cmd/iTemplate.js");

    var balancepay = function(orderId, orderNo, balanceAmount, orderTime, showType){
        this.orderId = orderId;
        this.orderNo = orderNo;
        this.balanceAmount = balanceAmount;
        this.orderTime = orderTime;
        this.balancecharge_page = this.balancepay_url = "javascript:;";
        this.showType = showType; //1:正常，2：余额不足
        return this.init();
    }
    balancepay.prototype = {
        constructor:balancepay,
        init: function(){
            var self = this;
            var html_1 = '<div class="widget_wrap" style="z-index:{zIndex2};background:none;margin:-188px auto;" ontouchmove="return false;">\
				<section class="section_1 on">\
					<form action="data/test.json" method="post">\
						<input type="hidden" name="orderId" value="{orderId}" />\
						<div class="div_total">\
							<p>共计金额</p>\
							<p>￥<span class="amount_total">{balanceAmount}</span></p>\
							<p>订单编号：<span class="order_id order_no">{orderNo}</p>\
							<p>订单时间：<sapn class="order_time">{orderTime}</sapn></p>\
						</div>\
						<div class="div_input">\
							<input type="password" name="Pwd" placeholder="请输入会员卡支付密码" maxlength="6" />\
						</div>\
						<div class="div_submit">\
							<p>\
								<a href="javascript:;"  class="btn red" data-button="1">确定</a>\
							</p>\
							<p>\
								<a href="javascript:;"  class="btn calcel" data-button="0">取消</a>\
							</p>\
						</div>\
					</form>\
				</section>\
				</div>';

            var html_2 = '<div class="widget_wrap" style="z-index:{zIndex2};background:none;margin:-188px auto;" ontouchmove="return false;">\
					<section class="section_2 on">\
						<div class="div_total">\
							<p>共计金额</p>\
							<p>￥<span class="amount_total">{balanceAmount}</span></p>\
							<p>订单编号：<span class="order_id order_number">{orderNo}</p>\
							<p>订单时间：<sapn class="order_time">{orderTime}</sapn></p>\
						</div>\
						<div class="div_tip">\
							<p class="tip_title">会员余额不足! </p>\
							<!--p class="tip_content">请选择其他支付方式,或充值后再支付</p-->\
						</div>\
						<div class="div_submit">\
							<!--p>\
								<a href="javascript:;" class="btn blue" data-button="2">选择其他支付方式</a>\
							</p-->\
							<p>\
								<a href="javascript:;"  class="btn green" data-button="3">去会员卡充值</a>\
							</p>\
						</div>\
					</form>\
				</section>\
				</div>';
            self.dialog = dialog(null, {
                orderId:self.orderId,
                orderNo:self.orderNo,
                balanceAmount:self.balanceAmount,
                orderTime:self.orderTime,
                TPL: (2 == self.showType) ? html_2 : html_1,
                classes:" pay_dialog ",
                callBack: function(evt){
                    self.callBack(evt);
                }
            });
            return self;
        },
        open: function(){
            this.dialog.open();
            return this;
        },
        close: function(){
            this.dialog.close();
            return this;
        },
        callBack: function(evt){
            var self = this, ele = evt.target, dataButton = ele.getAttribute("data-button");
            switch(dataButton){
                case "0":
                    self.close();
                    break;
                case "1":
                    self.pay();
                    break;
                case "2":

                    break;
                case "3":
                    location.href = self.balancecharge_page;
                    break;
                default:

                    break;
            }
            return self;
        },
        pay: function(){
            var self = this, l;
            var form = $(self.dialog.widget).find("form")[0];
            form.action = self.balancepay_url;
            l = loading();
            form.callBack = function(res){
                l.destroy();
                if (0 == res.Status || 3 == res.Status) {
                    self.close();
                }
                if ("onPaySuccess" in self) {
                    self.onPaySuccess(res);
                } else {
                    alert(res.Message);
                }
            }
            form.submit();
            return self;
        },
        config: function(arg){
            var self = this;
            if(arg && ("object" == typeof arg)){
                for(k in arg){
                    self[k] = arg[k];
                }
            }
            return self;
        }
    }


    module.exports = balancepay;
});