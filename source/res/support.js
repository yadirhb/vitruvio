/**
 * JavaScript Support for older versions
 */

//Check if native implementation available
/**
 * Object
 * */
if (!Object.create) {
    Object.create = function (o) {
        function F() {
        } // empty constructor
        F.prototype = o; // set base object as prototype
        return new F(); // return empty object with right [[Prototype]]
    };
}

if (!Object.setPrototypeOf) {
    Object.setPrototypeOf = function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    };
}

/*if(!Object.prototype.equals){
 Object.prototype.equals = function(obj){
 return this === obj;
 }
 }*/

if (!Object.getPrototypeOf) {
    if (({}).__proto__ === Object.prototype
        && ([]).__proto__ === Array.prototype) {
        Object.getPrototypeOf = function getPrototypeOf(object) {
            return object.__proto__;
        };
    } else {
        Object.getPrototypeOf = function getPrototypeOf(object) {
            // May break if the constructor has been changed or removed
            return object.constructor ? object.constructor.prototype : void 0;
        };
    }
}

if (!Object.prototype.hasOwnProperty) {
    Object.prototype.hasOwnProperty = function (prop) {
        return prop in this && !(prop in Object.getPrototypeOf(this));
    }
}

/**
 * Array
 * */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    }
}

if (!Array.prototype.each) {
    Array.prototype.each = function (func, direction) {
        return direction !== false ? each(this, func) : eachReverse(this, func);
    }
}

if (!Array.prototype.remove) {
    Array.prototype.remove = function (index) {
        if (index > -1) {
            this.splice(index, 1);
        }
    }
}

/**
 * Function
 * */
if (!Function.prototype.getName) {
    Function.prototype.getName = function () {
        var funcNameRegex = /function\s([^(]{1,})\(/;
        var results = (funcNameRegex).exec((this).toString());
        return (results && results.length > 1) ? results[1].trim() : "";
    }
}

if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP    = function() {},
            fBound  = function() {
                return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        if (this.prototype) {
            // Function.prototype doesn't have a prototype property
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();

        return fBound;
    };
}

/**
 * String
 * */
if (!String.prototype.contains) {
    String.prototype.contains = function (substring) {
        return this.indexOf(substring) > -1;
    }
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        return this.replace(rtrim, '');
    }
}

if (!String.prototype.replaceAll) {

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }

    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(escapeRegExp(search), 'g'), replacement);
    };
}

/**
 * JSON Support
 * */
if (!$global.JSON) {
    $global.JSON = {
        parse: function (sJSON) {
            return eval('(' + sJSON + ')');
        },
        stringify: (function () {
            var toString = Object.prototype.toString;

            var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
            var escFunc = function (m) {
                return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
            };
            var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
            return function stringify(value) {
                if (value == null) {
                    return 'null';
                } else if (isNumber(value)) {
                    return isFinite(value) ? value.toString() : 'null';
                } else if (isBoolean(value)) {
                    return value.toString();
                } else if (isObject(value)) {
                    if (isFunction(value.toJSON)) {
                        return stringify(value.toJSON());
                    } else if (isArray(value)) {
                        var res = '[';
                        for (var i = 0; i < value.length; i++)
                            res += (i ? ', ' : '') + stringify(value[i]);
                        return res + ']';
                    } else if (toString.call(value) === '[object Object]') {
                        var tmp = [];
                        for (var k in value) {
                            if (value.hasOwnProperty(k))
                                tmp.push(stringify(k) + ': ' + stringify(value[k]));
                        }
                        return '{' + tmp.join(', ') + '}';
                    }
                }
                return '"' + value.toString().replace(escRE, escFunc) + '"';
            };
        })()
    };
}