/**
 * Created by weihanqing on 15-03-18.
 */
'use strict';

require(["config"], function () {
    require(['zepto', 'fastclick','iscroll'], function ($,fastclick) {
        $(document).ready(function(){
            //FastClick解决zepto tap穿透
            fastclick.attach(document.body);
            var i = require('iscroll');
            debugger;
        });
    });
});