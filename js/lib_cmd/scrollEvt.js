
define(function(require, exprots, module){
    var $ = require("./zepto");

    var scrollEvt = (function($){
        var _bottomEvt = function(args, fn){
            this.args = args;
            this.sleeping = false;
        }
        _bottomEvt.prototype = {
            constructor: _bottomEvt,
            init: function(){
                var that = this;

                return that;
            },
            start: function(){
                var that = this;
                window.addEventListener("scroll", that, false);
                return that;
            },
            stop: function(){
                var that = this;
                window.removeEventListener("scroll", that, false);
                return that;
            },
            sleep: function(flag, time){
                var that = this;
                that.sleeping = !!flag;
                return that;
            },
            handleEvent: function(evt){
                var that = this;
                if(!that.sleeping){
                    var top = document.documentElement.scrollTop + document.body.scrollTop;
                    var textheight = $(document).height();
                    if (textheight - top - $(window).height() <= 100) {
                        that.args.loadData.call(that.args, event);
                    }
                }
                return that;
            }
        }

        return _bottomEvt;
    })($);

    module.exports = scrollEvt;
});