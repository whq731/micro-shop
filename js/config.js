/**
 * Created by weihanqing on 15-3-18
 * 通用的，全局都要加载的函数库的设置
 */

require.config({
    baseUrl: "js",
    paths: {
        //zepto及相关
        zepto:"libs/zepto/zepto",
        selector:"libs/zepto/selector",
        rsvp:'libs/zepto/rsvp-latest',
        rsvpajax:'libs/zepto/rsvp-ajax',
        //fastclick
        fastclick:'libs/fastclick/fastclick',
        //iscroll 5.0
        iscroll:'libs/iscroll/iscroll'
    },
    //版本/缓存控制
    version: {

    },
    //压缩后缀
    compressedPostfix: '',
    //压缩例外，不压缩的在此定义，main文件可以重写覆盖，暂时只支持模块的
    compressedException: [],
    //基础依赖在这里定义，main文件增加其他依赖
    shim: {
        zepto: {
            exports: "Zepto"
        }
    }
});