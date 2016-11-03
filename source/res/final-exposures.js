// Public Namespace
System.disableAutoLoad(false);
var __init__callbacks = [];

/**
 *
 * @param force
 */
System.noConflict = function (force) {
    var res = System;
    if ($original || force === true) {
        $global[$root] = $original;
    }
    return res;
}
/**
 *
 */
System.ready = function (/*callback[,fireOnReady]*/) {
    if (arguments.length > 0) {
        var listener = arguments[0], fireOnReady = Environment.isBrowser() ? false : arguments[1] === true;
        if (isFunction(listener)) {
            if (fireOnReady === false) {
                listener.call($global, System);
            } else {
                __init__callbacks.push(listener);
            }
        } else throw new System.exception.InvalidArgumentsException("Supplied arguments are invalid, expected (Function/Boolean)");
    }
};

if (Environment.isBrowser()) {
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            for (var c in __init__callbacks) {
                if (hasProp(__init__callbacks, c)) __init__callbacks[c].call($global, System);
            }
        }
    };
}
delete (xt = undefined);
$global[$root] = System;
if (Environment.isNode()) module.exports = System;
System.setGlobal($global);
/**
 *
 * @returns {number}
 */
System.getLoadTime = function () {
    return stime - (new Date().getMilliseconds());
}