
define(function(require, exports, module){
    var $ = require("lib_cmd/zepto"),
        main = require("js_cmd/main"),
        swipe = require("lib_cmd/swipe"),
    //imgPreview = require("js_cmd/imgPreview"),
        myDialog = require("lib_cmd/myDialog"),
        scrollEvt = require("lib_cmd/scrollEvt"),
        iTemplate = require("lib_cmd/iTemplate"),
        addressSelect = null;
    skuData = {},
        $eles = {},
        ele = {};



    function initPage(){
        //
        ele.getSkuData = function getSkuData(){
            //if(ele.buyedSum < ele.limitSum){
            var _l = loading();
            $.ajax({
                type: "POST",
                url: APP.urls.sku_url,
                data: {
                    GoodsId: APP.goodsId
                },
                async:true,
                success: function(res){
                    _l.destroy();
                    if(0 == res.Status){
                        ele.skuData = res.Data;
                    }
                },
                dataType: "json"
            });
            //}

        }
        //ele.getSkuData();
        //收藏
        $eles.icon_fav1[0].onclick = $eles.btn_add_fav[0].onclick = function(evt){
            var that = this, _collected = ele.collected;
            if(that.disabled){
                return;
            }
            ele.collected = !_collected;
            that.disabled = true;
            $.ajax({
                type: "POST",
                url: APP.urls.fav_url,
                data: {
                    state: !_collected
                },
                async: true,
                success: function (res){
                    that.disabled = false;
                    if(0 == res.Status){

                    }else{
                        ele.collected = _collected;
                    }
                },
                dataType: "json"
            });
        }
        //修改购买数量
        $eles.table_number.on("click", function(evt){
            var et = evt.target, en = et.tagName, newSku = ele.curSku;
            if(newSku.key && "INPUT" == en && "button" == et.type){
                newSku.sum +=("+" == et.value?1:-1);
                ele.curSku = newSku;
            }
        });
        $eles.sku_number.on("change", function(evt){
            var newSku = ele.curSku;
            newSku.sum = parseInt(this.value);
            ele.curSku = newSku;
        });
        //活动下拉事件
        $eles.dl_activity_ads.on("click", function(){
            this.classList.toggle("on");
        });
        //详情切换tab
        $eles.div_nav.on("click", function(evt){
            var et = evt.target, en = et.tagName, idx = 0;
            if("A" == en){
                idx = et.getAttribute("data-idx");
                ele.detailTableIndex = idx;
            }
        });
        //详情切换tab浮动
        var div_nav = {
            div_nav: $eles.div_nav,
            div_nav_fixed: $("#div_nav_fixed")[0],
            fixedtop: 0,
            top:0,
            start: function(){
                window.addEventListener("scroll", this, false);
            },
            handleEvent: function(){
                this.fiexdtop = div_nav_fixed.offsetTop;
                this.top = document.documentElement.scrollTop || document.body.scrollTop;
                this.div_nav[this.top > this.fiexdtop?"addClass":"removeClass"]("fixed");
            }
        }.start();

        //加入购物车
        $eles.btn_add_shopcart.on("click", function(evt){
            add2Shopcart(this, evt);
        });
        //直接购买
        $eles.btn_buy.on("click", function(evt){
            buy(this, evt);
        });

        //
        //ele.detailTableIndex = 1;
        for(var k in APP.goodsInfo){
            ele[k] = APP.goodsInfo[k];
        }

        //
        if(navigator.userAgent.toString().toLowerCase().indexOf("micromess")>-1){
            require.async("lib_cmd/imagePreview2", function(){
                console.log("imagePreview2");
            });
        }
    }


    /*******************
     ajax 方法
     *******************/
    function add2Shopcart(thi, evt){
        if(!ele.btn_disabled || ele.buyedSum >= ele.limitSum){
            return;
        }
        //限制非粉丝购买
        if(APP.limit && (1 == APP.limit.val) ){
            window.dialog_limit_buy.open();
            return;
        }
        var sku = ele.curSku;
        if(!sku.id){
            tip("请选择商品规格", { classes: "otip", t: 1000 });
            return;
        }
        if (!sku.sum) {
            var tips = [];
            if(0!= sku.status){
                tips.unshift("该商品已经下架了哦");
            }else if(0 == sku.inventory){
                tips.unshift("您来晚了，商品已经卖完啦");
            }else if(0 == sku.BuyMaxNum){
                tips.unshift("该商品最多可购买"+sku.BuyMaxNum+"件哦");
            }
            alert(tips[0]);
            return;
        }
        sku.sum = Math.min(Math.max(1, sku.sum), sku.BuyMaxNum, sku.inventory);
        thi.setAttribute("disabled", "disabled");
        var _loading = loading();
        $.ajax({
            type: "POST",
            url: APP.urls.add2shopcart_url,
            data: {
                itemId: APP.goodsId,
                productId: sku.id,
                Num: sku.sum
            },
            async: true,
            success: function (res) {
                _loading.destroy();
                thi.removeAttribute("disabled");
                if(0 == res.Status){
                    ele.shopcartSum += sku.sum;
                    confirm("成功加入购物车",{
                        TPL: '<div class="widget_wrap" style="z-index:{zIndex2};" >\
			                    <div class="widget_header"></div>\
			                    <div class="widget_body">{str}</div>\
			                    <div class="widget_footer">\
			                        <ul>\
			                            <li><button type="button" value="0" style="width:83px;">去结算</button></li>\
			                            <li><button type="button" value="1" style="width:83px;">继续购物</button></li>\
			                        </ul>\
			                    </div>\
			                </div>',
                        callBack: function(evt){
                            var et = evt.target;
                            if(evt && (et = evt.target) && ("BUTTON" == et.tagName) ){
                                var val = et.getAttribute("value");
                                if(0 == val){
                                    location.href = APP.urls.shopcart_page;
                                }else{
                                    ele.getSkuData();
                                    //location.reload();
                                }
                                return true;
                            }
                        }
                    });
                }else{
                    alert(res.Message);
                }
            },
            dataType: "json"
        });
    }
    //
    function buy(thi, evt){
        if(!ele.btn_disabled || ele.buyedSum >= ele.limitSum){
            return;
        }
        //限制非粉丝购买
        if(APP.limit && (1 == APP.limit.val) ){
            window.dialog_limit_buy.open();
            return;
        }
        var sku = ele.curSku;
        if(!sku.id){
            tip("请选择商品规格", { classes: "otip", t: 1000 });
            return;
        }
        if (!sku.sum) {
            var tips = [];
            if(0!= sku.status){
                tips.unshift("该商品已经下架了哦");
            }else if(0 == sku.inventory){
                tips.unshift("您来晚了，商品已经卖完啦");
            }else if(0 == sku.BuyMaxNum){
                tips.unshift("该商品最多可购买"+sku.BuyMaxNum+"件哦");
            }
            alert(tips[0]);
            return;
        }
        sku.sum = Math.min(Math.max(1, sku.sum), sku.BuyMaxNum, sku.inventory);
        var form = document.createElement("form");
        form.setAttribute("action", APP.urls.buy_url);
        form.setAttribute("method", "POST");
        var data = document.createElement("input");
        data.setAttribute("type", "hidden");
        data.setAttribute("name", "data");
        data.value = JSON.stringify([{ productId: sku.id, count: sku.sum }]);
        form.appendChild(data);
        form.submit();
    }

    //
    function initComments(){
        var tab_comment = (function(){
            var TPL = '<li>\
						<div class="tbox">\
							<div>\
								<span class="img_wrap"><img src="{HeadUrl}" /></span>\
								<p>{NickName}</p>\
								<p style="align:center;">{MemberGrade}</p>\
							</div>\
							<div>\
								<p class="comment_content">{Content}</p>\
								<p>\
									<label class="comment_rate" data-rate="{Star}"></label>\
									<label class="comment_time">{AddTime} </label>\
								</p>\
                                <p><div class="reply" {DisplayReply}>{ReplyContent}</div></p>\
							</div>\
						</div>\
					</li>';
            $eles.loading_bottom = $(main.ele.loading_bottom);
            $("#list_comments").append($eles.loading_bottom);
            function tab_comment(idx){
                var isLoading = false;
                this.index = idx;
                this.pageIndex = 1;
                this.pageSize = 10;
                this.end = false;
                this.on = false;
                this.scrollEvt = new scrollEvt(this);
                //
                Object.defineProperty(this, "isLoading", {
                    get: function(){
                        return isLoading;
                    },
                    set: function(v){
                        isLoading = v;
                        $eles.loading_bottom[isLoading?"removeClass":"addClass"]("vhidden");
                    }
                });
            }
            tab_comment.prototype = {
                close: function(){
                    var that = this;
                    that.on = false;
                    that.scrollEvt.stop();
                    return that;
                },
                open: function(){
                    var that = this;
                    that.loadData();
                    //
                    this.open = function(){
                        //
                        this.on = true;
                        if(this.on && !this.end){
                            this.scrollEvt.start();
                        }
                    }
                    this.open();
                    return that;
                },
                loadData: function(){
                    var that = this;
                    if(that.isLoading){
                        return;
                    }
                    that.start_time = +new Date();
                    that.isLoading = true;
                    $.ajax({
                        type: "POST",
                        url: APP.urls.comments_url,
                        data: {
                            type:that.index+1,
                            GoodsId:ele.goodsId,
                            pageIndex:that.pageIndex
                        },
                        async: true,
                        success: function (res) {
                            (function(that){
                                setTimeout(function(){
                                    that.isLoading = false;
                                    if(0 == res.Status){
                                        if(0 == res.Data.length || (that.pageIndex >= Math.ceil(res.total / that.pageSize) ) ){
                                            that.scrollEvt.stop();
                                        }else{
                                            $("#list_comments_"+that.index).append($(iTemplate.makeList(TPL, res.Data)) );
                                        }
                                    }else{
                                        console.log("get comment error of type:"+ that.index);
                                    }
                                    that.pageIndex++;
                                }, Math.max(0, that.start_time+500 - new Date().getTime()));
                            })(that);
                        },
                        dataType: "json"
                    });
                    return that;
                }
            }
            tab_comment.tabs = [0,0,0];
            return tab_comment;
        })();

        //
        tab_comment.tabs = tab_comment.tabs.map(function(v, idx){
            return new tab_comment(idx);
        });


        //评论切换tab
        $eles.nav_comments.on("click", function(evt){
            var et = evt.target, en = et.tagName, idx = 0;
            if("LI" == en){
                idx = et.getAttribute("data-idx");
                ele.commonTableIndex = idx;
                tab_comment.tabs.forEach(function(v, k){
                    tab_comment.tabs[k][k==idx?"open":"close"]();
                });

            }
        });
        //默认
        ele.commonTableIndex = 0;
        tab_comment.tabs[ele.commonTableIndex].open();
    }




    //dom ready
    $(function(){
        $eles = {
            label_title: $("#label_title"),
            slider_3_wrap: $("#slider_3_wrap"),
            label_price: $("#label_price"),
            label_activityTag: $("#label_activityTag"),
            icon_fav1: $("#icon_fav1"),
            label_price_original: $("#label_price_original"),
            dl_activity_ads: $("#dl_activity_ads"),
            //
            btn_selectAddr: $("#btn_selectAddr"),
            //
            list_sku: $("#list_sku"),
            table_number: $("#table_number"),
            //
            list_sku: $("#list_sku"),
            //底部菜单
            btn_add_fav: $("#btn_add_fav"),
            btn_link_shopcart: $("#btn_link_shopcart"),
            btn_add_shopcart: $("#btn_add_shopcart"),
            btn_buy: $("#btn_buy"),
            btip_widget: $("#btip_widget"),
            //sku
            table_number: $("#table_number"),
            sku_number: $("#sku_number"),
            sku_inventory: $("#sku_inventory"),
            //
            div_nav: $("#div_nav"),
            div_sections: $("#div_sections"),
            nav_comments: $("#nav_comments"),
            list_comments: $("#list_comments")
        }
        //
        ele = (function(){
            function Ele(){
                var skuData = {};
                var lstProductJson = {};
                var curSku = {};
                this.KEYS = [];
                //
                var title = "";
                var activityTag = '';
                var collected = false;
                var shopcartSum = 0;
                var comment = {};
                //
                var btn_disabled = true;
                var detailTableIndex = 1;
                var commonTableIndex = 0;

                Object.defineProperty(this, "skuData", {
                    get: function(){
                        return skuData;
                    },
                    set: function(v){
                        var that = this;
                        skuData = v;
                        that.lstProductJson = skuData.lstProductJson;
                        that.curSku = {};
                        initSkuView.call(that, skuData);
                        that.limitSum = skuData.limitSum;
                        that.buyedSum = skuData.buyedSum;
                        if((0 == that.limitSum) &&(0 == that.buyedSum) ){
                            that.limitSum = Infinity;
                        }
                        //限制购买
                        if(that.buyedSum >= that.limitSum){
                            $eles.btip_widget.show().find("#btip_label").html('该商品最多可购买' + ele.limitSum + '件,您已经不能再购买了');
                            $("#list_sku_li").hide();
                            $("#list_sku_number").hide();
                        }else if(0 == skuData.totalInventory){
                            $eles.btip_widget.show().find("#btip_label").html('您来晚了，商品已经卖完啦');
                            $("#list_sku_li").hide();
                            $("#list_sku_number").hide();
                        }
                        if(0 != that.skuData.status){
                            ele.btn_disabled = false;
                        }
                        //单规格
                        if(that.lstProductJson["0"]){
                            that.curSku = that.lstProductJson["0"];
                        }else{
                            var $inputs = $eles.list_sku.find("input");
                            var checkeds = [];
                            $inputs.on("click", skuCalc);
                            //
                            var invalidKEYS = [];
                            skuCalc();
                            function skuCalc(){
                                var _this = this;
                                checkeds = [];
                                $inputs.forEach(function(v){
                                    if((_this.name == v.name) && (v!=_this) ){
                                        v.checked = false;
                                        v.removeAttribute("checked");
                                    }
                                    if(v.checked){
                                        checkeds.push(v.value);
                                    }
                                });

                                for(var i=0, ci, sum = 0, flag = true; ci = $inputs[i]; i++){
                                    //循环sku data
                                    ci.disable1 = 0;
                                    sum = 0;
                                    for(var j in that.lstProductJson){
                                        var reg = new RegExp('\\b'+ci.value+'\\b', 'gi');
                                        if(reg.test(j)){
                                            sum += that.lstProductJson[j].sum;
                                        }
                                    }
                                    if(0 == sum){
                                        ci.disable1++;
                                    }else{

                                    }
                                    if(checkeds.length){
                                        ci.disable2 = 0;
                                        var zh = getZuhe(checkeds);
                                        zh.forEach(function(zv, zi){
                                            var sum = 0, _inArr = false;
                                            for(var j in that.lstProductJson){
                                                var inArr = zv.every(function(v){
                                                    var reg = new RegExp('\\b'+v+'\\b', 'gi');
                                                    return reg.test(j);
                                                });
                                                if(inArr){
                                                    var reg = new RegExp('\\b'+ci.value+'\\b', 'gi');
                                                    if(reg.test(j)){
                                                        _inArr = true;
                                                        sum += that.lstProductJson[j].sum;
                                                    }
                                                }
                                            }
                                            if(0 == sum && _inArr){
                                                ci.disable2++;
                                            }else{

                                            }
                                        });

                                    }

                                    if(ci.disable1 || ci.disable2){
                                        ci.setAttribute("disabled", "disabled");
                                    }else{
                                        ci.removeAttribute("disabled");
                                    }
                                }

                                //已经选中一种明确的组合
                                if (checkeds.length == that.skuData.lstSKUVal.length) {
                                    that.curSku = that.lstProductJson[checkeds.join(":")];
                                }else{
                                    that.curSku = {};
                                }


                                function getZuhe(arr){
                                    //arr_temp checked 选中的组合s
                                    var arr_temp = [];
                                    for(var i=0, ci; ci = arr[i]; i++){
                                        for(var j=0, len = arr_temp.length, cj; cj = arr_temp[j]; j++){
                                            if(j>=len){
                                                break;
                                            }
                                            var t = cj.slice(0);
                                            t.push(ci);
                                            arr_temp.push(t);
                                        }
                                        arr_temp.push([ci]);
                                    }
                                    return arr_temp;
                                }


                            }
                            //
                        }

                    }
                });
                //
                Object.defineProperty(this, "lstProductJson", {
                    get: function(){
                        return lstProductJson;
                    },
                    set: function(v){
                        v.forEach(function(v, k){
                            v.sum = v.BuyMaxNum&&v.inventory?1:0;
                            lstProductJson[v.key] = v;
                        });
                    }
                });
                //
                Object.defineProperty(this, "curSku", {
                    get: function(){
                        return curSku;
                    },
                    set: function(v){
                        var that = this, label_price = "", label_price_original = "";
                        curSku = v;
                        if(!curSku.key){
                            curSku.status = that.skuData.status;
                            curSku.sum = 1;
                            curSku.inventory = that.skuData.totalInventory;
                            curSku.BuyMaxNum = Infinity;
                            //
                            if(that.skuData.priceRange[0] == that.skuData.priceRange[1]){
                                label_price = formatPrice([that.skuData.priceRange[0].toFixed(2)].join("-") );
                            }else{
                                label_price = formatPrice([that.skuData.priceRange[0].toFixed(2), that.skuData.priceRange[1].toFixed(2)].join("-") );
                            }
                            if(that.skuData.priceOriginRange[0] == that.skuData.priceOriginRange[1]){
                                label_price_original = formatPrice([that.skuData.priceOriginRange[0].toFixed(2)].join("-"));
                            }else{
                                label_price_original = formatPrice([that.skuData.priceOriginRange[0].toFixed(2), that.skuData.priceOriginRange[1].toFixed(2)].join("-"));
                            }
                            //$eles.sku_inventory.html("(剩余"+curSku.inventory+ (that.skuData.limitSum&&(that.skuData.limitSum<Infinity)? (",限购"+that.skuData.limitSum+"件"):"" ) +")");
                        }else{
                            label_price = formatPrice(curSku.price.toFixed(2));
                            label_price_original = formatPrice(curSku.OriginalPrice.toFixed(2));
                            //$eles.sku_inventory.html("(剩余"+curSku.inventory+ (curSku.key&&curSku.BuyMaxNum? (",限购"+curSku.BuyMaxNum+"件"):"" ) +")");
                        }
                        $eles.sku_inventory.html("(剩余"+curSku.inventory+ (that.skuData.limitSum&&(that.skuData.limitSum<Infinity)? (",限购"+that.skuData.limitSum+"件"):"" ) +")");
                        curSku.sum = Math.max(0, Math.min(curSku.sum, curSku.BuyMaxNum, curSku.inventory));
                        if(curSku.BuyMaxNum&&curSku.inventory){
                            curSku.sum = Math.max(1, curSku.sum);
                        }
                        $eles.sku_number.val(curSku.sum);
                        $eles.label_price.html(label_price);
                        $eles.label_price_original.html(label_price_original);
                        $eles.label_price_original.parent()[label_price == label_price_original?"addClass":"removeClass"]("hidden");
                        //
                        function formatPrice(str){
                            return str.replace(/(\d+)\./g, function($1, $2){
                                return '<label>'+$2+'</label>.';
                            });
                        }
                        if("key" in curSku){
                            ele.btn_disabled = curSku.sum;
                        }else{
                            ele.btn_disabled = true;
                        }
                    }
                });
                //商品title
                Object.defineProperty(this, "title",{
                    set: function(v){
                        title = v;
                        $eles.label_title.html(title);
                    }
                });
                //商品title
                Object.defineProperty(this, "imgs",{
                    set: function(v){
                        // $eles.slider_3_wrap.find("ul").html(iTemplate.makeList('<li>\
                        // 			<a href="javascript:;">\
                        // 				<img src="{src}" />\
                        // 			</a>\
                        // 		</li>', v, function(k,v){
                        // 			return {
                        // 				src:v
                        // 			}
                        // 		}));
                        new Swipe(document.getElementById('slider_3_wrap'), {
                            speed:500,
                            loop:true,
                            //auto:3000,
                            indicate:"#slider_3_indicate"
                        });
                    }
                });
                //商品活动tag
                Object.defineProperty(this, "activityTag",{
                    set: function(v){
                        activityTag = v;
                        $eles.label_activityTag.attr("data-activity", activityTag);
                    }
                });
                //属性
                Object.defineProperty(this, "properties", {
                    set: function(v){
                        $(".section_specification div").html(iTemplate.makeList('<dd><label>{name}</label><label>{value}</label></dd>', v));
                    }
                });
                //详情
                Object.defineProperty(this, "detail", {
                    set: function(v){
                        $eles.div_sections.find("section").eq(1).html(v);
                    }
                });
                //商品详情tab
                Object.defineProperty(this, "detailTableIndex",{
                    get: function(){
                        return detailTableIndex;
                    },
                    set: function(v){
                        detailTableIndex = v;
                        $eles.div_nav.find("a").removeClass("on").eq(detailTableIndex).addClass("on");
                        $eles.div_sections.find("section").removeClass("on").eq(detailTableIndex).addClass("on");
                    }
                });
                //商品评论tab
                Object.defineProperty(this, "commonTableIndex", {
                    get: function(){
                        return commonTableIndex;
                    },
                    set: function(v){
                        commonTableIndex = v;
                        $eles.nav_comments.find("li").removeClass("on").eq(commonTableIndex).addClass("on");
                        $eles.list_comments.find("ul").removeClass("on").eq(commonTableIndex).addClass("on");
                    }
                });
                //
                //评论
                Object.defineProperty(this, "comment", {
                    get: function(){
                        return comment;
                    },
                    set: function(v){
                        comment = v;
                        //
                        if(comment.total){
                            $eles.div_nav.find("a").eq(2).html('评价（'+comment.total+'）');
                            $eles.nav_comments.html(iTemplate.makeList('<li class="on" data-idx="0">\
											<label >好评（{A}）</label>\
										</li>\
										<li data-idx="1">\
											<label>中评（{B}）</label>\
										</li>\
										<li data-idx="2">\
											<label>差评（{C}）</label>\
										</li>', [comment]));
                            initComments();
                        }else{
                            $eles.nav_comments.remove();
                            $eles.list_comments.html('<p class="no_comments">暂无评价</p>');
                        }
                    }
                });
                //收藏商品
                Object.defineProperty(this, "collected", {
                    get: function(){
                        return collected;
                    },
                    set: function(v){
                        collected = v;
                        //
                        $("#icon_fav1, #btn_add_fav")[collected?"addClass":"removeClass"]("on");
                    }
                });
                //购物车
                Object.defineProperty(this, "shopcartSum", {
                    get: function(){
                        return shopcartSum;
                    },
                    set: function(v){
                        shopcartSum = v;
                        //
                        $eles.btn_link_shopcart.attr({"data-count":shopcartSum, "href":APP.urls.shopcart_page});
                    }
                });
                //【立即购买】【加入购物车】按钮灰掉
                Object.defineProperty(this, "btn_disabled", {
                    get: function(){
                        return btn_disabled;
                    },
                    set: function(v){
                        btn_disabled = v;
                        if(0 != this.skuData.status){
                            btn_disabled = false;
                        }
                        $eles.btn_add_shopcart[btn_disabled?"addClass":"removeClass"]("on");
                        $eles.btn_buy[btn_disabled?"addClass":"removeClass"]("on");
                    }
                });
            }

            //
            function initSkuView(skuData){
                var that = this;
                var TPL_section = '<section>\
									<div>\
										<label>{name}</label>\
									</div>\
									<div>\
										{skus}\
									</div>\
								</section>',
                    TPL_sku = '<label class="label_radio">\
								<input type="checkbox" name="sku_{idx}" value="{key}"/>\
								<span>{val}</span>\
							</label>',
                    HTML = '',
                    HTML_sku = "";
                HTML = iTemplate.makeList(TPL_section, skuData.lstSKUVal, function(k, v){
                    that.KEYS[k] = [];
                    HTML_sku = iTemplate.makeList(TPL_sku, v.lstVal, function(kk, vv){
                        that.KEYS[k].push(vv.key);
                        return {
                            idx: k
                        }
                    });
                    return {
                        skus: HTML_sku
                    }
                });
                $eles.list_sku.html(HTML);
            }
            //
            return new Ele();
        })();
        //
        initPage();
    });
});