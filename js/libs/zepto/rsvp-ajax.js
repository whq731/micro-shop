/**
 * Created by 轶卓 on 14-4-24.
 */
//安卓2.2，2.3即使在对象内，也不能使用保留字作为函数名，所以为手机重写catch函数
RSVP.Promise.prototype.mobiCatch = function(onRejection, label) {
    return this.then(null, onRejection, label);
};

(function($, RSVP){
    //传入参数理论上不得有
    $.Pajax = function(para) {
        return new RSVP.Promise(function(resolve, reject){
            para.success = function(data){
                resolve(data);
            }
            para.error = function(xhr){
                reject(Error(xhr.statusText));
            }
            $.ajax(para);
        });
    }

    $.getRSVP = function(url){
        // 返回一个新的 Promise
        return new RSVP.Promise(function(resolve, reject) {
            // 经典 XHR 操作
            var req = new XMLHttpRequest();
            req.open('GET', url);

            req.onload = function() {
                // 当发生 404 等状况的时候调用此函数
                // 所以先检查状态码
                if (req.status == 200) {
                    // 以响应文本为结果，完成此 Promise
                    resolve(req.response);
                }
                else {
                    // 否则就以状态码为结果否定掉此 Promise
                    // （提供一个有意义的 Error 对象）
                    reject(Error(req.statusText));
                }
            };

            // 网络异常的处理方法
            req.onerror = function() {
                reject(Error("Network Error"));
            };

            // 发出请求
            req.send();
        });
    }

    $.getJSONRSVP = function(url){
        return $.getRSVP(url).then(JSON.parse);
    }

})(Zepto, RSVP);