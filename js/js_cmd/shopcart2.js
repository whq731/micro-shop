/**
 * Created by Way on 2015/3/23.
 */
define(function(require, exports, module){
    var $ = require("lib_cmd/zepto"),
        main = require("js_cmd/main"),
        messager = require("lib_cmd/messager"),
        ajax3 = require("lib_cmd/ajax3"),
        myDialog = require("lib_cmd/myDialog"),
    //scrollEvt = require("lib_cmd/scrollEvt"),
        angular = require.async("lib_cmd/angular.min", function(ang){
            initAngular(ang);
            l.destroy();
        });
    var l = loading();
    window.addEventListener("pageshow", function(e){
        if(sessionStorage.getItem("shopcartBuy") ){
            sessionStorage.removeItem("shopcartBuy");
            location.reload();
        }
    }, false);

    //
    window.shopcart_list = shopcart_list = (function(){
        var data = new FormData();
        data.append("pageIndex", 1);
        data.append("pageSize", 1000);
        var l = loading();
        new ajax3({
            url: APP.urls.shopcart_url,
            formData: data,
            type:"post",
            callback: function(res){
                l.destroy();
                if(res && (0 == res.Status) ){

                }else{
                    alert(res.Message);
                }
                shopcart_list = res;
                ""._publish("get_shopcart_list", res);
                activity = new Activity();
            }
        });
    })();

    //计算最优惠活动 优惠条件 101 满多少元减多少元;  102满多少元几折优惠;  103满多少件减多少元 ; 104满多少件几折优惠
    var Activity = (function(){
        var instanceActivity = null;
        function _Activity(){
            if(instanceActivity){
                return instanceActivity;
            }
            var self = this;
            self.length = 0;
            //所有活动
            self.allActivitys = {};
            //当前使用的活动
            self.curActivity = null;
            //参加活动的商品列表
            self.goods_ac = {};
            //活动最优排序 实际
            self._tmpAcs_0 = null;
            //活动最优排序 建议
            self._tmpAcs_1 = null;

            instanceActivity = self;
            return self;
        }

        //gap = getAllActivity
        _Activity.prototype = {
            gaa: function(data){
                var self = this;
                self.data = data;
                var index_k = 1000, _k, __kk;
                self.data.forEach(function(v, k){
                    if(v.MarketingJsons && v.MarketingJsons.length){
                        v.MarketingJsons.forEach(function(vv, kk){
                            _k = vv.Id;
                            vv.lstSaleInfoJsJsons.forEach(function(vvv, kkk){
                                __kk = _k + "-" + kkk + "-" + vvv.MarketingType;
                                if(__kk in self.allActivitys){
                                    vvv = self.allActivitys[__kk];
                                }else{
                                    //初始化
                                    vvv.ConditionVal = parseFloat(vvv.ConditionVal);
                                    vvv.MarketingVal = parseFloat(vvv.MarketingVal);
                                    vvv.goods = {};//参与活动商品列表
                                }
                                v.Titles = {};
                                vvv.id = __kk;
                                vvv.goods[v.Id] = {
                                    Sum: v.Sum,
                                    Price: v.Price
                                };
                                self.allActivitys[__kk] = vvv;
                                self.length +=1;
                            });
                        });
                    }
                });
                return self;
            },
            //gap = getActivityPrice
            gap: function(fn){
                var self = this,
                    tmpAcs = [], //活动数组，包含已经计算之后的优惠价格
                    _sum = 0,
                    _price = 0,
                    ac = null,
                    _getPrice,
                    _self_allActivitys = self.allActivitys;
                for(var k in _self_allActivitys){
                    ac = _self_allActivitys[k],
                        _sum = 0,
                        _price = 0,
                        _getPrice = new getPrice().config({curActivity: ac});
                    for(var i=0, ci; ci= self.data[i]; i++){
                        _getPrice.invoke(ci);
                    }
                    ac.price_origin = _getPrice.price_origin; // 原始价格
                    ac.price_youhui = _getPrice.price_youhui; // 优惠的价格
                    ac.sum_origin = _getPrice.sum_origin;//总的数量
                    tmpAcs.push(ac);
                }
                self._tmpAcs_0 = Object.create(tmpAcs).sort(function(a, b){
                    return a.price_youhui<b.price_youhui?1:-1;
                });
                //console.log(self);
                fn&&fn.call(self);
                return self;
            }
        }



        //获取当前活动是所有商品的价格
        var getPrice = (function(){
            function _getPrice(){
                this.ci = {};
                //被计算的总数和总价
                this.sum_origin = 0;
                this.price_origin = 0;
                //参加活动的数量和总价
                var sum_ac = 0;
                var price_ac = 0;
                //优惠后的价格，需要减去
                this.price_youhui = 0;
                this.curActivity = null;

                //被计算的总数和总价
                Object.defineProperties(this, {
                    "sum_ac": {
                        get: function(){
                            return sum_ac;
                        },
                        set: function(val){
                            sum_ac = val;
                        }
                    },
                    "price_ac": {
                        get: function(){
                            return price_ac;
                        },
                        set: function(val){
                            price_ac = val;
                        }
                    }
                });
            }
            _getPrice.prototype = {
                config: function(arg){
                    var self = this;
                    for(var k in arg){
                        self[k] = arg[k];
                    }
                    return self;
                },
                invoke: function(ci){
                    var self = this;
                    self.ci = ci;
                    self.sum_origin += ci.Sum;
                    self.price_origin += (ci.Sum*ci.Price);
                    //
                    if(ci.Id in self.curActivity.goods){
                        self.sum_ac += ci.Sum;
                        self.price_ac += ci.Sum * ci.Price;
                        acPrice.call(this);
                        setTitle.call(this, ci);
                    }
                    return self;
                }
            }
            //计算单件商品的最优活动方案
            function setTitle(ci){
                var _self = {
                    ci: ci,
                    curActivity: this.curActivity,
                    sum_ac: ci.Sum,
                    price_ac: ci.Sum*ci.Price,
                    price_youhui: 0
                }
                acPrice.call(_self);
                ci.Titles[_self.curActivity.id] = {
                    price: _self.price_youhui,
                    Title: _self.curActivity.Title,
                    price_qiwang: _self.price_qiwang,
                    price_need: _self.price_need,
                    title_qiwang: _self.title_qiwang
                }
            }

            //计算活动优惠价格
            function acPrice(){
                var ac = this.curActivity;
                switch(ac.MarketingType){
                    //满X元减X元
                    case 101:
                        //达到条件
                        if(this.price_ac >= ac.ConditionVal){
                            if(ac.IsTopMax){
                                this.price_youhui = parseInt((this.price_ac/ac.ConditionVal))*ac.MarketingVal;
                            }else{
                                this.price_youhui = ac.MarketingVal;
                            }
                        }//else{
                        //这种方式，需要支付的价格
                        this.price_qiwang = ac.ConditionVal - ac.MarketingVal;
                        //需要增加的钱数
                        this.price_need = ac.ConditionVal - this.price_ac;
                        this.title_qiwang = "再加"+(this.price_need.toFixed(2))+"元就可以参加"+ac.Title;
                        //}
                        break;
                    //满X元几X折优惠
                    case 102:
                        //达到条件
                        if(this.price_ac >= ac.ConditionVal){
                            // if(!ac.IsTopMax){
                            // 	this.price_youhui = parseInt((this.price_ac/ac.ConditionVal))*(1 - ac.MarketingVal);
                            // }else{
                            this.price_youhui = this.price_ac * (1 - ac.MarketingVal/10);
                            //}
                        }//else{
                        //这种方式，需要支付的价格
                        this.price_qiwang = ac.ConditionVal - ac.ConditionVal*(1- ac.MarketingVal/10);
                        //需要增加的钱数
                        this.price_need = ac.ConditionVal - this.price_ac;
                        this.title_qiwang = "再加"+(this.price_need.toFixed(2))+"元就可以参加"+ac.Title;
                        //}
                        break;
                    //满X件减X元
                    case 103:
                        //达到条件
                        if(this.sum_ac >= ac.ConditionVal){
                            if(ac.IsTopMax){
                                this.price_youhui = parseInt((this.sum_ac/ac.ConditionVal))*ac.MarketingVal;
                            }else{
                                this.price_youhui = ac.MarketingVal;
                            }
                        }//else{
                        //这种方式，需要支付的价格
                        this.price_qiwang = (ac.ConditionVal*this.ci.Price) - ac.MarketingVal;
                        //需要增加的钱数
                        this.price_need = (this.ConditionVal - this.sum_ac)*this.ci.Price - this.price_ac;
                        this.title_qiwang = "再加"+(ac.ConditionVal-this.sum_ac)+"件就可以参加"+ac.Title;
                        //}
                        break;
                    //满X件X折优惠
                    case 104:
                        //达到条件
                        if(this.sum_ac >= ac.ConditionVal){
                            // if(!ac.IsTopMax){
                            // 	this.price_youhui = this.price_ac*parseInt((this.sum_ac/ac.ConditionVal))*(1 - ac.MarketingVal);
                            // }else{
                            this.price_youhui = this.price_ac * (1 - ac.MarketingVal/10);
                            //}
                        }//else{
                        //这种方式，需要支付的价格
                        this.price_qiwang = (ac.ConditionVal*this.ci.Price)*(1 - ac.MarketingVal/10);
                        //需要增加的钱数
                        this.price_need = (this.ConditionVal - this.sum_ac)* this.ci.Price - this.price_ac ;
                        this.title_qiwang = "再加"+(ac.ConditionVal- this.sum_ac)+"件就可以参加"+ac.Title;
                        //}
                        break;
                }
            }

            return _getPrice;
        })();



        return _Activity;
    })();

    var activity = {};
    function initAngular(angular){
        var WmallAPP = angular.module("WmallAPP", []);
        WmallAPP.controller("shopcart_Controller", ["$scope", "shopcart_Service", "$filter", function($scope, shopcart_Service, $filter){
            $scope.data = null;
            $scope.selected = [];
            $scope.totleAmount = 0;
            $scope.totleSum = 0;
            $scope.activity = {};
            var _activity = {};
            Object.defineProperty($scope, "activity", {
                get: function(){
                    return _activity;
                },
                set: function(v){
                    for(var k in v){
                        _activity[k] = v[k];
                    }
                }
            });
            var i = 0;
            $scope.$watch('selected',function(){
                //if($scope.selected.length){
                if(activity.length){
                    activity
                        .gaa($scope.selected)
                        .gap(function(){
                            $scope.totleAmount = this._tmpAcs_0[0].price_origin - this._tmpAcs_0[0].price_youhui;
                            $scope.totleSum = this._tmpAcs_0[0].sum_origin;
                            $scope.activity = this._tmpAcs_0[0];
                        });
                }else{
                    getTotal(0);
                }
                // }else{
                // 	$scope.totleAmount = $scope.totleSum = 0;
                // 	$scope.activity = {};
                // }

            });
            shopcart_Service.get_shopcart_list(null, function(res){
                //mock res
                res = {"Status":0,"Message":"success","Data":{"invalid":[],"valid":[{"Description":"L","Id":180097,"ImageUrl":"http://shopimg.weimob.com/308628/Goods/1502081255381328.jpg@0e_320w_320h_0c_0i_0o_90Q_1x.src","DetailUrl":"/vshop/Goods/GoodsDetail3/166088","ItemId":166088,"Name":"天蝎座-夜雾魅影","limitSum":0,"BuyMax":50,"BuyedSum":0,"Sum":1,"Price":520.00,"productId":462132,"FreightpriceType":0,"IsMemberPrice":true,"inventory":"50","status":"0","MarketingJsons":[]}]},"total":1}
                $scope.data = $scope.data||[];
                $scope.invalidData = $scope.invalidData||[];
                $scope.data = $scope.data.concat(res.Data.valid||[]);
                $scope.invalidData = $scope.invalidData.concat(res.Data.invalid||[]);
                activity = new Activity().gaa($scope.data).gap();
                setTimeout(function(){
                    $scope.$apply();
                }, 0);
            });
            //
            $scope.checkAll = false;
            $scope.enableDel = false;
            $scope.selectAll = function(thi, evt){
                $scope.enableDel = $scope.checkAll = !$scope.checkAll;
                $scope.data.forEach(function(v, k){
                    v.checked = v.Sum && $scope.checkAll;
                });
                $scope.selected  =  $scope.data.filter(function(v){
                    return v.checked;
                });
            }
            $scope.selectOne = function(thi, evt, idx){
                $scope.data[idx].checked = !$scope.data[idx].checked;
                $scope.checkAll = $scope.data.every(function(v){
                    return (0==v.Sum) || v.checked;
                });
                $scope.enableDel = $scope.data.some(function(v){
                    return v.checked;
                });
                $scope.selected  =  $scope.data.filter(function(v){
                    return v.checked;
                });
            }
            $scope.selectDel = function(thi, evt){
                var delId = [],
                    _data = $scope.data.filter(function(v){
                        v.checked&&(delId.push(v.Id));
                        return !v.checked;
                    }),
                    fd = new FormData();
                fd.append("delIds", delId);
                shopcart_Service.del_goods(fd, {
                    action:APP.urls.del_goods_url,
                    loading:true,
                    callBack: function(res){
                        if(0 == res.Status){
                            $scope.data = _data;
                            $scope.selected = [];
                            $scope.enableDel = false;
                            $scope.checkAll = false;
                            $scope.$apply();
                        }else{
                            alert(res.Message);
                        }
                    }
                });
            }
            //
            $scope.changeSum = function(thi, evt, type, idx){
                var ci = $scope.data[idx], _Sum = ci.Sum;
                if (1 == ci.status) {
                    alert("该商品已下架了哦~");
                    return;
                }
                switch(type){
                    case "-":
                        _Sum --;
                        $scope.data[idx].Sum = Math.max(1, _Sum);
                        break;
                    case "+":
                        _Sum ++;
                        if ((ci.BuyMax <= ci.Sum) || (ci.inventory <= ci.Sum)) {
                            alert(ci.inventory <= ci.BuyMax ? "商品购买数量不能超过库存数哦~":"该商品最多可购买"+(ci.BuyMax+ci.BuyedSum)+"件"+(0 == ci.BuyedSum?"":"，您已购买"+ ci.BuyedSum +"件") );
                            return;
                        }
                        $scope.data[idx].Sum = _Sum;
                        break;
                }
                if(activity.length){
                    activity
                        .gaa(ci.checked?$scope.selected:[ci])
                        .gap(function(){
                            if(ci.checked){
                                $scope.totleAmount = this._tmpAcs_0[0].price_origin - this._tmpAcs_0[0].price_youhui;
                                $scope.totleSum = this._tmpAcs_0[0].sum_origin;
                                $scope.activity = this._tmpAcs_0[0];
                            }
                        });
                }else{
                    getTotal(0);
                }
            }
            //
            function getTotal(from){
                var t_s = t_a = 0;
                $scope.selected.forEach(function(ci, i){
                    if(0 == from){
                        $filter('reSum')(ci.Sum, ci);
                    }
                    t_s +=ci.Sum;
                    t_a += ci.Sum*parseFloat(ci.Price);
                });
                $scope.totleSum = t_s;
                $scope.totleAmount = t_a;
            }
            //
            $scope.checkout = function(thi, evt){
                if(!$scope.selected.length){
                    return;
                }
                //限制非粉丝购买
                if(APP.limit && (1 == APP.limit.val) ){
                    window.dialog_limit_buy.open();
                    return;
                }
                var tip_flag = false,
                    tip_content = [],
                    _data = [],
                    jsonData = [],
                    ci;
                var form = document.getElementById("form_shopcart_list");
                var input = document.getElementById("cartData");

                for (var i=0, ci; ci = $scope.selected[i]; i++) {
                    if (0 == ci.Sum) {
                        if (0 != ci.status) {
                            tip_content[1] = "购物车有已下架的商品哦~";
                            tip_flag = true;
                            break;
                        } else {
                            tip_content[0] = ci.inventory <= ci.BuyMax ? "购物车有已经卖完的商品哦~" : "购物车有已达到限定购买数量的商品哦~";
                        }
                        tip_flag = true;
                    }
                    _data.push([ci.Id, ci.Sum]);
                    jsonData.push({ productId: ci.productId, count: ci.Sum });
                    var ProductJson = JSON.stringify(jsonData);
                }
                if (tip_flag) {
                    alert(tip_content.pop());
                } else {
                    var formData = new FormData();
                    formData.append("buy_list", _data);
                    formData.append("json", ProductJson);
                    var l = loading();
                    new ajax3({
                        url: APP.urls.shopcartBuy_url,
                        formData: formData,
                        type: "POST",
                        callback: function (res) {
                            l.destroy();
                            if (0 == res.Status) {
                                input.value = ProductJson;
                                var input2 = document.createElement("input");
                                input2.type = "hidden";
                                input2.name = "buyFrom";
                                input2.value = 1;
                                form.appendChild(input2);
                                sessionStorage.setItem("shopcartBuy", true);
                                form.action = APP.urls.ordercreate_page;
                                form.submit();
                            }
                            else if (res.Status == 2) {
                                alert(res.Message);
                            }
                            else {
                                alert("提交订单失败");
                            }
                            //if(res.url){
                            //	location.href = res.url;
                            //}else{
                            //	alert(res.Message);
                            //}
                        }
                    });
                }

            }
            //
            $scope.goToDetail = function(thi, evt, ci){
                location.href = ci.DetailUrl;
            }
            //删除失效商品
            $scope.delInvalidGoods = function(thi, evt){
                var delId = $scope.invalidData.map(function (v) {
                    return v.Id;
                });
                fd = new FormData();
                fd.append("delIds", delId);
                shopcart_Service.del_goods(fd, {
                    action:APP.urls.del_goods_url,
                    loading:true,
                    callBack: function(res){
                        if(0 == res.Status){
                            $scope.invalidData = [];
                            $scope.$apply();
                        }else{
                            alert(res.Message);
                        }
                    }
                });
            }

        }]);

        WmallAPP.factory("shopcart_Service", ['$http', function($http){
            var pageIndex = 0,
                pageSize = 100;
            function get_shopcart_list(data, fn){
                ""._subscribe("get_shopcart_list", "0", function(res){
                    if (res && res.Data) {
                        fn.call(null, res);
                        ""._unsubscribe("get_shopcart_list", "0");
                    }
                });
                ""._publish("get_shopcart_list", shopcart_list);
            }
            //
            function del_goods(data, cfg){
                data = data||new FormData();
                cfg = cfg||{};
                cfg.loading&&(cfg.loading = loading());
                new ajax3({
                    url: cfg.action,
                    formData: data,
                    type:cfg.method||"post",
                    timeout:cfg.timeout||"",
                    callback: function(res){
                        cfg.loading.destroy();
                        if(res && (0 == res.Status) ){
                            if(pageIndex >= Math.ceil(res.total/pageSize)){
                                res.end = true;
                            }
                        }else{
                            alert(res.Message);
                        }
                        cfg.callBack(res);
                    }
                });
            }


            return{
                get_shopcart_list: get_shopcart_list,
                del_goods:del_goods
            }
        }]);
        //
        WmallAPP.filter('reSum',function(){
            return function(Sum, g){
                g.ac_title = (function(){
                    var t = [""], p = [-Infinity, Infinity];
                    if(g.Titles){
                        for(var k in g.Titles){
                            if(g.Titles[k].price>p[0]){
                                p[0] = g.Titles[k].price;
                                t[0] = g.Titles[k].Title;
                            }
                            if(g.Titles[k].price_qiwang<p[1] && (0 == g.Titles[k].price) ){
                                p[1] = g.Titles[k].price_qiwang;
                                t[1] = g.Titles[k].title_qiwang;
                            }
                        }
                    }
                    return t.slice(-1).toString();
                })();

                if(0 != g.status){
                    g.Sum = 0;
                }
                g.Sum = Math.max(0, Math.min(g.Sum, g.BuyMax, g.inventory));
                return g.Sum;
            }
        });
        //
        WmallAPP.filter('rePrice',function(){
            return function(price){
                return parseFloat(price).toFixed(2);
            }
        });
        // invalid reison
        WmallAPP.filter('ac_title', function(){
            return function(ac_title, v){
                return { "1": "已下架", "2": "库存不足", "3": "限购" + v.limitSum + "件", "4": "已下架" }[v.status];
            }
        });

        //
    }

});