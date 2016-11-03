/**
 * Created by yadirhb on 2/23/2016.
 */
Static.Class('utils.Executor', {
    'apply': function (callback, args) {
        if (callback) {
            if (System.isFunction(callback)) {
                args = System.isArray(args) ? args : [];
                callback.apply(callback, args);
            }
            else throw new System.Exception("Cannot execute object that is not a function", 'ExecutorException');
        }
    },
    'schedule': function (callback, repeat, interval) {
        if (!(System.isFunction(callback)) || repeat < 0 || interval < 0) throw new System.exception.InvalidArgumentsException();
        var e = {
            cancelled: false, stop: function () {
                e.cancelled = true;
            }
        }
        var creator = setInterval(function () {
            if (--repeat < 0 || e.cancelled) {
                clearInterval(creator);
                return;
            }
            callback(e);
        }, interval);
    }
})