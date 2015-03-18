/**
 * Created by 轶卓 on 14-5-20.
 * require的插件，根据config加载min文件
 * todo：本地存储
 */
;(function () {
    var original_loader = requirejs.load;
    requirejs.load = function (context, moduleName, url) {
        var config = requirejs.s.contexts._.config;

        if(config.compressedPostfix) {
            if(config.compressedException.indexOf(moduleName) == -1) {
                url = url.replace('.js', config.compressedPostfix+'.js')
            }
        }
        if(config.version) {
            if(config.version[moduleName]) {
                url = url+'?v='+config.version[moduleName];
            } else if(config.version.defaultVersion) {
                url = url+'?v='+config.version.defaultVersion;
            }
        }

        original_loader(context, moduleName, url);
    };
}());
