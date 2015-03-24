/**
 * Created by Way on 2015/3/23.
 */
define(function(require, exports, modules){
    var _queue = {};
    Object.defineProperties(_queue, {
        _arrays:{
            value:{}
        },
        _listener: {
            value: function(_name, _args){
                if(_name in _queue._arrays){
                    var fns = _queue._arrays[_name]||{};
                    for(var k_t in fns){
                        fns[k_t].call(null, _args);
                    }
                }
                //console.log(_queue);
            }
        },
        _add:{
            value: function(_name, _id, _fn){
                _id = _id || new Date().getTime();
                if(_name in _queue._arrays){

                }else{
                    _queue._arrays[_name] = {};
                }
                _queue._arrays[_name][_id] = _fn;
                //console.log(_queue);
            }
        },
        _remove:{
            value: function(_name, _id){
                if(_name in _queue._arrays){
                    if(_id in _queue._arrays[_name]){
                        delete _queue._arrays[_name][_id];
                    }
                }
            }
        }
    });

    Object.defineProperties(Object.prototype, {
        _publish: {
            value: function(_name, _args){
                _queue._listener.apply(null, arguments);
            }
        },
        _subscribe: {
            value: function(_name, _id, _fn){
                _queue._add.apply(null, arguments);
            }
        },
        _unsubscribe: {
            value: function(_name, _id){
                _queue._remove.apply(null, arguments);
            }
        }
    });
});