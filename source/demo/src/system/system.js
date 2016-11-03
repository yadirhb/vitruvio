/*System.JS-0.1.0 2016-09-26 */
/**
 * @author yadirhb@gmail.com
 * @description
 * @version Version 1.0.0
 */
(function () {
    var $global = this, stime = new Date().getMilliseconds();
    var CONFIG = {
        'GLOBAL': $global,
        'DEBUG': false
    };

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
/**
 * JavaScript extensions
 */

// Object extensions
/**
 * Returns true if the current instance is a subject instance.
 * @param subject
 * @returns {boolean}
 */
if (!Object.prototype.is) {
    Object.prototype.is = function (type) {
        return type && isFunction(type) ? this instanceof type : false;
    }
}

/**
 * The as operator is like a cast operation.
 * However, if the conversion isn't possible, as returns null instead of raising an exception.
 */
if (!Object.prototype.as) {
    Object.prototype.as = function (type) {
        if (type) {
            if (isFunction(type) && this.is(type)) {
                var $type = new type, context = this, proto = Object.getPrototypeOf(type.prototype);
                if (type.is(Interface)) {
                    var patch = {};
                    for (var m in $type) {
                        if (isFunction($type[m]) && ( (m in $type) && !(m in proto))) {
                            if (!m.contains("$")) {
                                eval("patch['" + m + "'] = function (" + getSignature(context[m]) + ") { return context['" + m + "'].apply(context, arguments);}");
                            }
                        }
                    }

                    return apply($type, patch);
                }

                return supersede($type, this);
            } else if (isObject(type)) {
                return supersede(apply(new type.constructor, type), this);
            }
        }
    }
}
/**
 * Created by yadirhb on 12/26/2015.
 */

function isBrowser() {
    return typeof (window) != "undefined";
}

function isNode() {
    return typeof(process) != 'undefined';
}

function isCordova() {
    return isBrowser() && userAgent.isMobile() && document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
}

function isMobile() {
    return isCordova();
}

function isDesktop() {
    return isNode();
}

var userAgent;
if (isBrowser()) {
    userAgent = {
        /**
         * Returns if the Browser supports Blob
         * */
        'isBlobSupported': function () {
            return "Blob" in $global;
        },
        /**
         * Nested static class to Internet Explorer solutions utilities
         * */
        'IE': {
            // Returns the version of Internet Explorer or a -1
            // (indicating the use of another browser).
            'getVersion': function () {
                var match = navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
                return match ? parseFloat(match[1]) : -1;
            },
            /**
             * Identify if IE version is below 10
             */
            'isOldVersion': function () {
                var v = this.getVersion();
                return v != -1 && v <= 9;
            }
        },
        /**
         * Identify whether the browser is IE or not
         * @return True if the browser is IE, false otherwise
         */
        'isIE': function () {
            if ('navigator' in $global) {
                var ua = $global.navigator.userAgent;
                var newIe = ua.indexOf('Trident/');
                return ((newIe > -1));
            }
        },
        'isEdge': function () {
            return !this.isIE() && !!window.StyleMedia;
        },
        /**
         * Identify whether the browser supports HTML5 <audio> or not
         * @returns True if the browser supports HTML5 <audio>, false otherwise
         * */
        'isAudioSupported': function () {
            try {
                if (typeof document.createElement("audio").play != "undefined") return true;
            }
            catch (ex) {
                return false;
            }
        },
        'isAndroid': function () {
            if ('navigator' in $global) return navigator.userAgent.indexOf('Android') > -1 && navigator.userAgent.indexOf('Mozilla/5.0') > -1 && navigator.userAgent.indexOf('AppleWebKit') > -1;
            return false;
        },
        'isBlackBerry': function () {
            if ('navigator' in $global) return navigator.userAgent.match(/BlackBerry/i);
            return false;
        },
        'isSafari': function () {
            return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        },
        'isiOS': function () {
            if ('navigator' in $global) return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            return false;
        },
        'isOpera': function () {
            if ('navigator' in $global) return navigator.userAgent.match(/Opera Mini/i);
            return false;
        },
        'isWindowsPhone': function () {
            if ('navigator' in $global)
                return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
        },
        'isFirefox': function () {
            return typeof InstallTrigger !== 'undefined';
        },
        'isChrome': function () {
            return !!window.chrome && !!window.chrome.webstore;
        },
        'isMobile': function () {
            return (this.isAndroid() || this.isBlackBerry() || this.isiOS() || this.isOpera() || this.isWindowsPhone() || false);
        },
        'isBlink': function () {
            return (this.isChrome() || this.isOpera()) && !!window.CSS;
        },
        'isAOSPBrowser': function () {
            if ('navigator' in $global) {
                // Native Android Browser
                var navU = navigator.userAgent;
                // Android Browser (not Chrome)
                var regExAppleWebKit = new RegExp(/AppleWebKit\/([\d.]+)/);
                var resultAppleWebKitRegEx = regExAppleWebKit.exec(navU);
                var appleWebKitVersion = (resultAppleWebKitRegEx === null ? null : parseFloat(regExAppleWebKit.exec(navU)[1]));

                return this.isAndroid() && appleWebKitVersion !== null && appleWebKitVersion < 537;
            }
            return false;
        }
    };
}

//###### Error functions

/**
 * Represents errors that occur during application execution.
 * @param message Sets the message that describes the current exception.
 * @param name Sets a custom name for the instance or Exception by default.
 * */
function Exception(/*message[, name]*/) {
    if (arguments.length > 0) {
        if (this.is(Exception)) {
            var context = this, message = arguments[0],
                name = arguments[1] ? arguments[1] : name = arguments[1] ? arguments[1] : "getClass" in context ? context.getClass().getName() : "Exception",
                err = Error.apply(this, arguments);

            this.name = err.name = name;
            this.message = message = err.message;

            //check if there is a stack property supported in browser
            if (err.stack) {
                // remove one stack level:
                if (isBrowser() && userAgent.isFirefox()) {
                    // Mozilla:
                    this.stack = err.stack.substring(err.stack.indexOf('\n') + 1);
                }
                else if (isNode() || (isBrowser() && userAgent.isChrome())) {
                    // Google Chrome/Node.js:
                    this.stack = err.stack.replace(/\n[^\n]*/, '');
                }
                else {
                    this.stack = err.stack;
                }
            }
            return this;
        }
    }
}
Exception.prototype = Error.prototype;

function defaultOnError(err) {
    throw err;
}

//#####Primary types functions
var op = Object.prototype, ostring = op.toString;

function isArray(it) {
    return getClassName(it) === 'Array';
}

function isBoolean(it) {
    return typeof it === 'boolean';
}

function isBooleanValue(it) {
    /^(?:true|false)$/i.test(it);
}

function isFloat(it) {
    return isNumber(it) && it === parseFloat(it.toString());
}

function isFunction(it) {
    return getClassName(it) === 'Function';
}

function isInteger(it) {
    return isNumber(it) && it === parseInt(it.toString());
}

function isObject(it) {
    return typeof it === 'object';
}

function isNull(it) {
    return it === null;
}

function isNullValue(it) {
    return /^\s*$/.test(it);
}

function isNumber(it) {
    return typeof it === 'number';
}

function isString(it) {
    return typeof it === 'string';
}

function isEmpty(obj) {

    // // null and undefined are "empty"
    if (obj == null) return true;

    if ('undefined' !== Object.keys) {
        // Using ECMAScript 5 feature.
        return (0 === Object.keys(obj).length);
    } else {
        // Using legacy compatibility mode.
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
}

/**
 *
 * @param obj
 * @param type
 * @returns {boolean}
 */
function is(obj, type) {
    return obj instanceof type;
}

/**
 * Gets objects class name
 * */
function getClassName(obj) {
    if (typeof obj === "undefined")
        return "undefined";
    if (obj === null)
        return "null";

    // if (obj.constructor != Object.constructor) {
    //     var str = (obj.prototype ? obj.prototype.constructor : obj.constructor).toString();
    //     var cname = str.match(/function\s(\w*)/)[1];
    //     var aliases = ["", "anonymous", "Anonymous"];
    //     return aliases.indexOf(cname) > -1 ? "Function" : cname;
    // }

    return ostring.call(obj)
        .match(/^\[object\s(.*)\]$/)[1];
}

//#####Collection functions
/**
 * Helper function for iterating over an array. If the func returns
 * a true value, it will break out of the loop.
 */
function each(ary, func) {
    if (ary) {
        var i;
        for (i = 0; i < ary.length; i += 1) {
            if (ary[i] && func(ary[i], i, ary)) {
                break;
            }
        }
    }
}

/**
 * Helper function for iterating over an array backwards. If the func
 * returns a true value, it will break out of the loop.
 */
function eachReverse(ary, func) {
    if (ary) {
        var i;
        for (i = ary.length - 1; i > -1; i -= 1) {
            if (ary[i] && func(ary[i], i, ary)) {
                break;
            }
        }
    }
}

//#####Object functions
function hasProp(obj, prop) {
    return Object.hasOwnProperty.call(obj, prop);
}

function getOwn(obj, prop) {
    return hasProp(obj, prop) && obj[prop];
}

/**
 * Cycles over properties in an object and calls a function for each
 * property value. If the function returns a truthy value, then the
 * iteration is stopped.
 */
function eachProp(obj, func) {
    var prop;
    for (prop in obj) {
        if (hasProp(obj, prop)) {
            if (func(obj[prop], prop)) {
                break;
            }
        }
    }
}

/**
 * The System.freeze() method freezes an object: that is, prevents new properties from being added to it; prevents
 * existing properties from being removed; and prevents existing properties, or their enumerability, configurability,
 * or writability, from being changed. In essence the object is made effectively immutable. The method returns the
 * object being frozen.
 * */
function freeze(it) {
    return Object.freeze ? Object.freeze(it) : it;
}

/**
 * Simple function to mix in properties from source into target,
 * but only if target does not already have a property of the same name.
 */
function mixin(target, source, force, deepStringMixin) {
    if (source) {
        eachProp(source, function (value, prop) {
            if (force || !hasProp(target, prop)) {
                if (deepStringMixin && typeof value === 'object' && value && !isArray(value) && !isFunction(value) && !(value instanceof RegExp)) {

                    if (!target[prop]) {
                        target[prop] = {};
                    }
                    mixin(target[prop], value, force, deepStringMixin);
                } else {
                    target[prop] = value;
                }
            }
        });
    }
    return target;
}

/**
 * Simple function to make a supersede the properties between two objects.
 * The properties into the same.
 */
function supersede(target, source, force, deepStringMixin) {
    if (source) {
        eachProp(source, function (value, prop) {
            if (hasProp(target, prop)) {
                if (deepStringMixin && typeof value === 'object' && value && !isArray(value) && !isFunction(value) && !(value instanceof RegExp)) {

                    if (!target[prop]) {
                        target[prop] = {};
                    }
                    supersede(target[prop], value, force, deepStringMixin);
                } else {
                    target[prop] = value;
                }
            }
        });
    }
    return target;
}

//#####Event functions
/**
 * Alias a method while keeping the context correct, to allow for overwriting of target method.
 *
 * @param {String} name The name of the target method.
 * @param {Object} scope The scope of the target method.
 * @return {Function} The aliased method
 * @api private
 */
function alias(name, scope) {
    scope = scope || this;
    return function aliasClosure() {
        return scope[name].apply(scope, arguments);
    };
}

/**
 * Similar to Function.prototype.bind, but the 'this' object is specified
 * first, since it is easier to read/figure out what 'this' will be.
 * */
function bind(scope, fn) {
    return function () {
        return fn.apply(scope, arguments);
    };
}

function addListener(evt, listener, scope) {
    scope = scope || this;
    var listeners = getListenersAsObject.call(scope, evt);
    var listenerIsWrapped = typeof listener === 'object';
    var key;

    for (key in listeners) {
        if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
            listeners[key].push(listenerIsWrapped ? listener : {
                listener: listener,
                once: false
            });
        }
    }

    return scope;
}

function defineEvent(evt, scope) {
    scope = scope || this;
    getListeners.call(scope, evt);
    return scope;
}

function emitEvent(evt, args, scope) {
    scope = scope || this;
    var listenersMap = getListenersAsObject.call(scope, evt);
    var listeners;
    var listener;
    var i;
    var key;
    var response;

    for (key in listenersMap) {
        if (listenersMap.hasOwnProperty(key)) {
            listeners = listenersMap[key].slice(0);
            i = listeners.length;

            while (i--) {
                // If the listener returns true then it shall be removed from the event
                // The function is executed either with a basic call or an apply if there is an args array
                listener = listeners[i];

                if (listener.once === true) {
                    removeListener.call(scope, evt, listener.listener);
                }

                response = listener.listener.apply(this, args || []);

                if (response === getOnceReturnValue.call(scope)) {
                    removeListener.call(scope, evt, listener.listener);
                }
            }
        }
    }

    return scope;
}

/**
 * Fetches the events object and creates one if required.
 *
 * @return {Object} The events storage object.
 * @api private
 */
function getEvents(scope) {
    scope = scope || this;
    return scope._events || (scope._events = {});
}

/**
 * Fetches the current value to check against when executing listeners. If
 * the listeners return value matches this one then it should be removed
 * automatically. It will return true by default.
 *
 * @return {*|Boolean} The current value to check for or the default, true.
 * @api private
 */
function getOnceReturnValue(scope) {
    scope = scope || this;
    if (scope.hasOwnProperty('_onceReturnValue')) {
        return scope._onceReturnValue;
    }
    else {
        return true;
    }
}

function getListeners(evt, scope) {
    scope = scope || this;
    var events = getEvents.call(scope);
    var response;
    var key;

    // Return a concatenated array of values matching events if
    // the selector is a regular expression.
    if (evt instanceof RegExp) {
        response = {};
        for (key in events) {
            if (events.hasOwnProperty(key) && evt.test(key)) {
                response[key] = events[key];
            }
        }
    }
    else {
        response = events[evt] || (events[evt] = []);
    }

    return response;
}

function getListenersAsObject(evt, scope) {
    scope = scope || this;
    var listeners = getListeners.call(scope, evt);
    var response;

    if (listeners instanceof Array) {
        response = {};
        response[evt] = listeners;
    }

    return response || listeners;
}

/**
 * Finds the index of the listener for the event in its storage array.
 *
 * @param {Function[]} listeners Array of listeners to search through.
 * @param {Function} listener Method to look for.
 * @return {Number} Index of the specified listener, -1 if not found
 * @api private
 */
function indexOfListener(listeners, listener) {
    var i = listeners.length;
    while (i--) {
        if (listeners[i].listener === listener) {
            return i;
        }
    }

    return -1;
}

function removeEvent(evt, scope) {
    scope = scope || this;
    var type = typeof evt;
    var events = getEvents.call(scope);
    var key;

    // Remove different things depending on the state of evt
    if (type === 'string') {
        // Remove values listeners for the specified event
        delete events[evt];
    }
    else if (evt instanceof RegExp) {
        // Remove values events matching the regex.
        for (key in events) {
            if (events.hasOwnProperty(key) && evt.test(key)) {
                delete events[key];
            }
        }
    }
    else {
        // Remove values listeners in values events
        delete scope._events;
    }

    return scope;
}

function removeListener(evt, listener, scope) {
    scope = scope || this;
    var listeners = getListenersAsObject.call(scope, evt);
    var index;
    var key;

    for (key in listeners) {
        if (listeners.hasOwnProperty(key)) {
            index = indexOfListener(listeners[key], listener);

            if (index !== -1) {
                listeners[key].splice(index, 1);
            }
        }
    }

    return scope;
}

//#####DOM functions
function scripts() {
    return document.getElementsByTagName('script');
}

/**
 * Allow getting a global that is expressed in
 * dot notation, like 'a.b.c'.
 * */
function getGlobal(value, separator) {
    separator = separator || '.';
    if (!value) {
        return value;
    }
    var g = global;
    each(value.split(separator), function (part) {
        g = g[part];
    });
    return g;
}

//##### Kernel FUNCTIONS

/**
 * Copies the properties from as many source objects as defined into a container
 * object.
 *
 * @param container
 *            {Object} The original object in which will be mixed values sources
 *            properties.
 * @param source
 *            {Object} The source of properties to be copied into the container
 *            object.
 * @return {Object} The resultant container object.
 */
function apply(/*container[, source1,...sourceN] */) {
    if (arguments.length > 1 && arguments[0] != null)
        for (var i = 1; i < arguments.length; i++)
            for (var propName in arguments[i]) {
                var source = arguments[i];
                if (source.hasOwnProperty(propName))
                    try {
                        arguments[0][propName] = source[propName];
                    } catch (e) {
                    }
            }
    return arguments[0];
}

function getSignature(func) {
    if (func && isFunction(func)) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function (arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function (arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    }

    return "";
}

/**
 * Instantiate a specific function, applies values definition properties and assign a proto object.
 * @param type {Function}
 */
function create(type, def, base) {
    // empty constructor
    type.prototype = base ? typeof base === 'function' ? new base() : base : new Class(); // set base object as prototype
    return apply(new type(), def); // return empty object with right [[Prototype]]
}

/**
 * Defines a new member and registers it into the wrapper object.
 *
 * @param memberName
 *            {String} The name of the member to be defined. It must be a valid
 *            namespace identifier.
 * @param definition
 *            {Object} Contains the public class members.
 * @param wrapper
 *            {Object} Defines the wrapper of the new Object, if not provided
 *            window will be taken.
 */
function define(type, baseClass, members, statics) {
    // empty constructor
    type.prototype = baseClass ? typeof baseClass === "function" ? new baseClass() : baseClass : new Class(); // set base object as prototype
    type.prototype.constructor = type;
    type.prototype = apply(type.prototype, members || {});
    return apply(type, statics || {}); // return empty object with right [[Prototype]]
}
var $root = "System", System  = {'$global' : $global}, $original = $global[$root];
var validIdientifierRegex = /^@?[a-z_A-Z]\w+(?:\.@?[a-z_A-Z]\w+)*$/;

/**
 * Base Class for inheritance into the SystemJS.
 * @returns {Type}
 * @constructor
 */
function Type(/*[Origin]*/) {
    if (this.is(Type)) {
        var $type = arguments[0];
        /**
         * Gets the Type instance type.
         * @returns {Object}
         */
        this.getType = function () {
            return $type;
        }

        return this;
    }
}

/**
 *
 * @param prev
 * @param current
 * @returns {DynamicContainer}
 * @constructor
 */
function DynamicContainer(prev, current) {
    if (this.is(DynamicContainer)) {
        var context = this;

        /**
         *
         * @param curr
         * @returns {DynamicContainer}
         */
        this.updateCurrent = function (curr) {
            prev = current;
            current = curr;
            return context;
        }

        /**
         *
         * @returns {*}
         */
        this.getCurrent = function () {
            return current;
        }

        /**
         *
         * @returns {*}
         */
        this.getPrev = function () {
            return prev;
        }

        return this;
    }
}

/**
 * @param name
 * @param container
 * @returns {Member}
 * @constructor
 */
function Member(/*[Type]*/) {
    if (this.is(Member)) {
        var context = this, name = arguments[0], container = arguments[1], $type = arguments[2];
        Type.call(this, $type || Member);

        /**
         * Gets the Member instance name;
         * @returns {String}
         */
        this.getName = function () {
            return name;
        }

        /**
         * Gets the Member instance context. This method is suitable to be overwrote in inherited members.
         */
        this.getContext = function () {
            return context;
        }

        /**
         * @protected
         * @returns {Object/Function}
         */
        this.getParent = function () {
            var cont = container;
            if (cont && !cont.is(Member)) {
                cont = new OutsiderContainer(cont);
            }
            return cont;
        }

        /**
         * Gets the Member instance container.
         * @returns {Object/Function}
         */
        this.getContainer = function () {
            var cont = this.getParent();
            if (cont) {
                if (cont.is(DynamicContainer)) {
                    cont = cont.getCurrent();
                } else if (cont.is(OutsiderContainer)) {
                    cont = cont.getContext();
                }
            }
            return cont;
        }

        /**
         * Gets the Member instance's full path_module String.
         * @returns {String}
         */
        this.getFullPath = function () { // global.A.B.C; A.B.C
            var path = "";
            var cont = this.getContainer();

            while (cont && cont.is(Member) && !cont.is(OutsiderContainer)) {
                path = cont.getName() + "." + path;
                cont = cont.getContainer();
            }

            return path + this.getName();
        }

        return this;
    }
}

define(Member, Type, {
    'getMember': function (member) {
        // if(typeof member !== 'string' &&
        // !Core.RegExp.Identifier.test(member))
        // throw new Error("[InvalidArgumentException]");
        return this.getContext()[member];
    },
    'hasMember': function (member) {
        return this.getMember(member) != undefined;
    },
    'addMember': function (member) {
        if (member.is(Member)) {
            // Get the current container instance
            return this.getContext()[member.getName()] = Member.updateParent(member, this);
        }
        throw new System.exception.InvalidTypeException("The supplied object must be a  instance");
    },
    'removeMember': function (member) {
        if (member.is(Member)) {
            var m = this.getContext()[member.getName()];
            if (m) {
                try {
                    delete this.getContext()[member.getName()];
                } catch (error) {
                    this.getContext()[member.getName()] = undefined;
                }
                return Member.updateParent(m);
            }
        }
        throw new System.exception.InvalidArgumentsException("The supplied object must be a Member instance");
    }
}, {
    'BuilderTemp': function BuilderTemp() {
        if (this.is(BuilderTemp)) {
            this.onBuild = new Function;
        }
    },
    'updateParent': function (member, current) {
        if (member.is(Member)) {
            var container = member.getContainer(),
                parent = typeof (container) == "undefined" || !container.is(DynamicContainer) ? new DynamicContainer(container, current) : container.updateCurrent(current);
            member.getParent = function () {
                return parent;
            }
            return member;
        }
        throw new System.exception.InvalidArgumentsException("The supplied object must be a Member instance");
    },
    'register': function (member) {
        if (member.is(Member)) {
            return Loader.register(member.getFullPath(), member);
        }
        throw new System.exception.InvalidArgumentsException("The supplied object must be a Member instance");
    }
});

function OutsiderContainer(/*[Member]*/) {
    if (this.is(OutsiderContainer)) {
        var self = arguments[0];
        Member.call(this, "");

        this.getContext = function () {
            return self;
        }
    }
}
define(OutsiderContainer, Member);

/**
 * The Namespace method can be used either to get a Namespace instance or to define a namespace object and attach inner members in it.
 * @param config String/Object
 * config object contains:
 * {
 * 		'$name': String,
 * 		'$container' : Object/Function // Specifies the container of the newly created Namespace instance, cannot be null, or undefined. Global is used by default.
 * }
 * @param member... If the Namespace is being instantiated, this argument could be the wrapper object which will contain the namespace instance.
 * Otherwise Member sequence, comma separated, which will represent the nested members of the current namespace.
 * @constructor
 */
function Namespace(/*[Member]*/) {
    if (arguments.length > 0) {
        var config = {}, cfx = arguments[0];
        if (cfx != null && cfx != undefined) { // Check if not null or undefined
            // Extract the configurations for create the namespace if ir doesn't exist.
            if (isString(cfx)) {
                config['$name'] = cfx;
            } else if (isObject(cfx)) {
                config = cfx;
            } else throw new System.exception.InvalidTypeException("The first argument must be either a [String/Object], but " + getClassName(cfx) + " was supplied instead");

            if (!(validIdientifierRegex.test(config.$name)))
                throw new Exception("Invalid namespace identifier: '" + config.$name + "'", 'InvalidIdentifierException');

            var container = config.$container || (CONFIG.GLOBAL || $global);

            if (this.is(Namespace)) { // Check if is instantiation
                if (arguments.length <= 2) {
                    container = arguments[1] || container;

                    var wrapper = Namespace.getLastNode(container, config.$name),
                        name = config.$name.replace(wrapper.name, "");
                    name = name[0] == "." ? name.substring(1, name.length) : name; // com.example

                    container = wrapper.container;

                    if (name != "") {
                        var nsparts = name.split(".");


                        // loop through the parts and create a nested namespace if necessary
                        do {
                            name = nsparts.shift();
                            // check if the current parent already has the namespace declared
                            // if it isn't, then create it
                            if (nsparts.length == 0) break;

                            container = container[name] = new Namespace(name, container);
                        } while (nsparts.length > 0)


                        // Call the super for initialization
                        Member.call(this, name, container, Namespace);

                        /**
                         * @override
                         * @param member
                         */
                        this.addMember = function (member) {
                            return Member.register(Member.prototype.addMember.call(this, member));
                        }

                        return container[name] = this;
                    }

                    return container;
                }
                throw new System.exception.InvalidArgumentsException("Invalid arguments number, expected no more than 2.")
            } else {
                var ns;
                if (!Namespace.contains(container, config.$name)) {
                    ns = new Namespace(config.$name, container);
                } else {
                    var node = Namespace.getLastNode(container, config.$name);
                    if (node && ("container" in node)) ns = node["container"];
                }

                if (ns) {
                    function updateContainer(member, ns) {
                        if (member && member.is(Member)) {
                            Loader.unregister(member.getFullPath());
                            var cont = member.getContainer();
                            if (cont && cont.is(Member)) cont.removeMember(member);

                            ns.addMember(member);
                        }
                    }

                    for (var i = 1; i < arguments.length; i++) {
                        var arg = arguments[i];
                        if (arg && arg.is(Member.BuilderTemp)) {
                            arg.onBuild = function (member) {
                                updateContainer(member, ns);
                            }
                        }
                        else updateContainer(arg, ns);
                    }
                }
                return ns;
            }
        }
    }
    throw new System.exception.InvalidArgumentsException("The first argument must be specified");
}

define(Namespace, Member, undefined, {
    'contains': function (container, ns) {
        return Namespace.getLastNode(container, ns)['name'] == ns;
    },
    'getLastNode': function (container, ns) {
        if (!(ns && typeof ns === 'string')
            || !(container && typeof container === 'object' || typeof container === 'function'))
            throw new System.exception.InvalidArgumentsException("Expected types (String, [Object | Function]) to search into namespace.");

        if (!(validIdientifierRegex.test(ns))) {
            throw new Exception("Invalid  namespace: '" + ns + "'", 'InvalidClassNameException');
        }

        var nsparts = ns.split("."), result = {'name': "", 'container': container}, first = true;

        // loop through the parts and create a nested namespace if necessary
        while (nsparts.length > 0) {
            var node = nsparts.shift();
            // check if the current parent already has the namespace declared
            // if it isn't, then create it

            if (node in container) {
                result['container'] = container = container[node];
                result['name'] += first ? node : "." + node;
            } else break;
            first = false;
        }

        return result;
    }
});

function Loader() {
}

var map = {};

function DependencyRequest(name, module) {
    if (this.is(DependencyRequest)) {
        this.module = module;
        this.name = name;

        this.isSuccess = function () {
            return module && !module.is(Error);
        }
    }
}

define(Loader, Function, undefined, {
    'isAutoLoadDisabled': true,
    'loaders': {
        "values": { // Platform
            "values": [] // Client
        }
    },
    'using': function (dependency, callback) {
        if (dependency) {
            dependency = dependency.is(String) ? [dependency] : dependency;

            var requests = [], unresolved = [], caller = arguments.callee.caller, async = false;

            dependency.each(function (dep) {
                if (dep in map) {
                    if (requests.indexOf(map[dep]) == -1) {
                        requests.push(map[dep]);
                    }
                } else if (unresolved.indexOf(dep) == -1) {
                    unresolved.push(dep);
                }
            });

            if (unresolved.length > 0) {
                if (callback && isFunction(callback)) {
                    async = true;
                    Loader.observe(dependency, function onObserve() {
                        if (isString(dependency)) {
                            if (requests.indexOf(map[dependency]) == -1) requests.push(map[dependency])
                        } else if (isArray(dependency)) {
                            dependency.each(function (dep) {
                                if (requests.indexOf(map[dep]) == -1) requests.push(map[dep]);
                            })
                        }
                        try {
                            return callback.apply(caller, requests);
                        } catch (e) {
                        }
                    });
                }

                function identify(mods) {
                    if (mods) {
                        if (mods.is(Array)) {
                            mods.each(function (module) {
                                identify(module);
                            });
                        } else {
                            if (mods.isSuccess()) {
                                var name = mods.name, classpath = name;//.replaceAll("/", ".");
                                var module = mods.module;

                                // var index = unresolved.indexOf(name);
                                if (classpath in map) {
                                    // unresolved.remove(index);
                                    if (requests.indexOf(map[classpath]) == -1) requests.push(map[classpath]);
                                } else if (!(module && module.is(Member))) {
                                    Loader.notify(name);
                                }
                            }
                        }
                    }
                    return;
                }

                function onload(modules) {
                    return identify(modules);
                }

                var modules = Loader.load(unresolved, onload, async);

                identify(modules);
            }

            return dependency.length == 1 && requests.length == 1 ? requests[0] : undefined;
        }
    },
    'load': function load(deps, callback, async) {
        if (!Loader.isAutoLoadDisabled) {
            var info = Environment.getInfo(), loader;

            loader = Loader.getLoader(info) || Loader.getSystemLoader();
            return loader ? loader.load(deps, callback, async) : undefined;
        }
    },
    'observers': {
        'add': function add(index, observer) {
            if (!(index in this)) this[index] = [];
            if (this[index].indexOf(observer) == -1) this[index].push(observer);

            return observer;
        },
        'remove': function (index) {
            var dep = this[index];
            if (dep) {
                try {
                    delete this[index];
                } catch (e) {
                    this[index] = undefined;
                }
                return dep;
            }
        }
    },
    /**
     *
     * @param dependency
     * @param callback
     * @returns {DependencyObserver}
     * @constructor
     */
    'DependencyObserver': function DependencyObserver(dependency, callback) {
        if (dependency && isFunction(callback)) {
            if (this.is(DependencyObserver)) {
                var context = this, deps = [], loadedDeps = [];
                /**
                 *
                 */
                this.onLoaded = function (loaded, object) {
                    var i = deps.indexOf(loaded);
                    if (i != -1) {
                        deps.remove(i);
                        loadedDeps[i + 1] = object;
                    }

                    if (deps.length == 0) {
                        callback.apply(callback, loadedDeps);
                    }
                }

                if (isString(dependency)) {
                    if (!map[dependency]) {
                        deps.push(dependency);
                        return Loader.observers.add(dependency, this);
                    }
                } else if (isArray(dependency)) {
                    each(dependency, function (dep) {
                        if (!map[dep]) {
                            deps.push(dep);
                            Loader.observers.add(dep, context);
                        }
                    });

                    return this;
                }
            }
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String/String[], Function)");
    },
    /**
     *
     * @param dependency
     * @param callback
     */
    'observe': function (dependency, callback) {
        if (dependency && callback && isFunction(callback)) {
            return new Loader.DependencyObserver(dependency, callback);
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String/String[], Function)");
    },
    'notify': function (dependency) {
        if (dependency && isString(dependency)) {
            var observers = Loader.observers.remove(dependency);
            each(observers, function (observer) {
                if (observer.is(Loader.DependencyObserver)) {
                    observer.onLoaded(dependency, map[dependency]);
                }
            });
            return;
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String)");
    },
    'register': function (classPath, object) {
        if (classPath && isString(classPath) && object && (isObject(object) || isFunction(object))) {
            var target = map[classPath] = object;
            Loader.notify(classPath);
            return target;
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String, Object/Function)");
    },
    'unregister': function (classPath) {
        if (classPath && isString(classPath)) {
            var target = map[classPath];
            try {
                delete map[classPath];
            } catch (e) {
                map[classPath] = undefined;
            }
            return target;
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String, Object/Function)");
    },
    'disableAutoLoad': function (disable) {
        Loader.isAutoLoadDisabled = disable === true;
    },
    'getLoader': function (descriptor) {
        if (descriptor && isObject(descriptor)) {
            var loader = Loader.loaders[descriptor.environment];
            if (loader) {
                loader = (loader[descriptor.client] || loader['values']);
            } else {
                loader = Loader.loaders.values;
            }
            return loader[descriptor.index || 0];
        }

    },
    'getSystemLoader': function () {
        if (!Loader.$sysloader) {
            Loader.$sysloader = new System.runtime.Loader();
        }
        return Loader.$sysloader;
    },
    'setLoader': function (loader) {
        if (loader && loader.is(System.runtime.Loader)) {
            var env = loader.environment ? loader.environment.is(Array) ? loader.environment : [loader.environment] : ['values'],
                client = loader.client ? loader.client.is(Array) ? loader.client : [loader.client] : ['values'];

            env.each(function (environment) {
                if (!Loader['loaders'][environment]) {
                    Loader['loaders'][environment] = {"values": []};
                }

                client.each(function (cl) {
                    if (!Loader['loaders'][environment][cl]) {
                        Loader['loaders'][environment][cl] = [];
                    }

                    Loader['loaders'][environment][cl].push(loader);
                })
            });
            return;
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, loader object expected to be instanceof '" + $root + ".runtime.Loader' class.");
    }
});

var clsMembers = {
    'getAllMethods': function () {
        var methods = [];
        var $super = this;

        while ($super = $super.$superclass) {
            $super.getAllMethods().each(function (method) {
                methods.push(method);
            });
        }

        this.getDeclaredMethods().each(function (method) {
            methods.push(method);
        });
        return methods;
    },
    'getDeclaredMethods': function () {
        var methods = [], def = this['prototype']['$def'];
        if (def) {
            for (var m in def) {
                if (hasProp(def, m) && typeof def[m] == 'function') {
                    methods.push(new System.reflection.Method(m, def[m]));
                }
            }
        }
        return methods;
    },
    'is': function (type) {
        return is(this.getContext(), type);
    }
}

/**
 * @param className String the class name
 * @param definition Object
 * @constructor
 */
function Class(/*[Member]*/) {
    var classpath = arguments[0], definition = arguments[1], def = apply({}, definition);
    if (is(this, Class)) {
        if (arguments.callee.caller == Class) { //Instantiation of classes objects
            var context = this, base, constructor, $ifaces = [], CustomType;
            eval("CustomType = function " + classpath + "(/*[Class]*/){ return this; }");

            if ('constructor' in def && hasProp(def, 'constructor')) {
                constructor = def.constructor;
                delete def.constructor;
            }

            if ('$extends' in def) {
                switch (typeof def['$extends']) {
                    case 'string':
                        def['$extends'] = Loader.using(def['$extends']);
                        if (!def['$extends'] || !isFunction(def['$extends'])) {
                            //if () throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(def['$extends'])['constructor']['name']);
                            throw new Exception('The super class definition was unresolved', "UnresolvedSuperClassException");
                        }
                    case 'function':
                        base = def['$extends'];
                        delete def['$extends'];
                        break;
                    default:
                        throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(def['$extends'])['constructor']['name']);
                }

                if (constructor == undefined) constructor = base;
            }

            if (constructor == undefined) constructor = CustomType;

            var $class = (function (base) {
                var func;

                function construct() {
                    if (base) this.$super = base;
                    constructor.apply(this, arguments);
                    if (isFunction(base)) {
                        this.$super = this.as(base);
                    }
                    return this;
                }

                eval("func = function " + classpath + "(/*[Class]*/){ construct.apply(this, arguments); }");
                return func;
            })(base);

            var cleanDef = removeKeyWords(def);

            if (base) {
                define($class, new (define(CustomType, base.prototype))(), undefined, {
                    '$superclass': base
                });
            }

            if ('$implements' in def) {
                function collectIfaces(iface) {
                    if (isString(iface)) {
                        var name = iface;
                        iface = Loader.using(iface);
                        if (!iface) throw new Exception('Interface definition unresolved', "UnresolvedInterfaceException");
                    }

                    if (isFunction(iface)) {
                        $ifaces.push(new iface);
                    } else throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(iface)['constructor']['name']);
                }

                if (isArray(def['$implements'])) {
                    each(def['$implements'], function (iface) {
                        collectIfaces(iface);
                    })
                } else collectIfaces(def['$implements']);

                delete def['$implements'];
            }

            Member.call(this, classpath, undefined, Class);

            this.getInterfaces = function () {
                return $ifaces;
            }

            $class = apply($class, this, clsMembers);

            apply($class.prototype, mixin(cleanDef, {
                'getClass': function () {
                    return $class;
                },
                '$def': cleanDef,
                '$proto': $class.prototype,
                'is': function (type) {
                    var _isIt = false;
                    if (isFunction(type)) {
                        if (is(this, type)) return true;
                        else if ($ifaces.length > 0) {
                            $ifaces.each(function (iface) {
                                if (iface.is(type)) return _isIt = true;
                            });
                        }
                    }
                    return _isIt;
                }
            }));

            if ($ifaces.length > 0) {
                System.Interface.ensureImplements.apply($class, [$class].concat($ifaces));
            }

            return $class;
        }
    } else {
        if (arguments.length == 2) {
            if (classpath && isString(classpath) && definition && isObject(definition)) {
                var ns = new Namespace(classpath, def['$container']),
                    name = ns.getName(), container = ns.getParent(), $static = def.$static;

                delete def['$static'];

                delete def['$container'];

                try {
                    var $class = apply(new Class(name, def), $static);
                    return Member.register(container.addMember($class));
                } catch (e) {
                    var unresolved = [];
                    switch (e.name) {
                        case "UnresolvedSuperClassException":
                        case "UnresolvedInterfaceException":
                            if ("$extends" in definition) {
                                unresolved.push(definition['$extends']);
                            }
                            if ("$implements" in definition) {
                                if (isString(definition['$implements'])) {
                                    unresolved.push(definition['$implements']);
                                } else if (isArray(definition['$implements'])) {
                                    unresolved = unresolved.concat(definition['$implements']);
                                }
                            }
                            var builderTemp = new Member.BuilderTemp(name, e);
                            Loader.observe(unresolved, function (error) {
                                if (!error) {
                                    var cls = Class(classpath, definition);
                                    return builderTemp.onBuild(cls);
                                }
                            });
                            return builderTemp;
                        default:
                            throw e;
                    }
                }
            }
            throw new System.exception.InvalidArgumentsException("Invalid arguments provided, expected (String, Object).");
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments number, expected exactly 2.")
    }
    throw new System.exception.IllegalCallException("Cannot explicitly create Class instances.");
}

define(Class, Member);

function removeKeyWords(obj) {
    if (obj) {
        var res = {};
        for (var p in obj) {
            if (hasProp(obj, p) && !p.contains("$")) res[p] = obj[p];
        }
        return res;
    }
}

/**
 * Static classes reference
 */
var Static = {
    'Class': function () {
        var args = arguments[1], def = {};

        if (args && isObject(args) && hasProp(args, 'constructor')) {
            def.constructor = args.constructor;
            try {
                delete args.constructor;
            } catch (e) {
                args.constructor = undefined;
            }
        }

        return System.freeze(Class(arguments[0], apply(def, {'$static': removeKeyWords(args)})));
    }
};

/** Core publishing section */
System = new Namespace($root, {});
System.$global = $global;
/**
 * Functions
 **/
System.isArray = isArray;
System.isFunction = isFunction;
System.isObject = isObject;
System.isBoolean = isBoolean;
System.isNumber = isNumber;
System.isString = isString;
System.isInteger = isInteger;
System.isFloat = isFloat;
System.isNull = isNull;
System.getClassName = getClassName;
System.using = Loader.using;
System.freeze = freeze;
System.alias = alias;
System.bind = bind;
System.apply = apply;
System.mixin = mixin;

System.setGlobal = function (/*Namespace*/) {
    CONFIG.GLOBAL = arguments[0] || CONFIG.GLOBAL;
}

System.enableDebug = function (/*Boolean*/) {
    CONFIG.DEBUG = true === arguments[0];
}

/**
 * Enables or disables the external resource load.
 * @param enable True for automate loading, False otherwise.
 */
System.disableAutoLoad = function (enable) {
    Loader.disableAutoLoad.apply(this, arguments);
}

System.isAutoLoadDisabled = function () {
    return Loader.isAutoLoadDisabled;
}

System.setLoader = function (loader) {
    return Loader.setLoader.apply(this, arguments);
}

System.config = function configure(config) {
    var cfg = arguments[0], message = "The supplied configuration is not what expected.";
    if (cfg) {
        if (cfg.is(Function)) {
            try {
                cfg = cfg() || {};
            } catch (e) {
                message = e.message;
            }
        }

        if (isObject(cfg)) {
            System.disableAutoLoad(cfg.disableAutoLoad || System.isAutoLoadDisabled());
            System.enableDebug(cfg.enableDebug || CONFIG.DEBUG);
            System.setGlobal(cfg.global || CONFIG.GLOBAL);

            if (cfg.loader) {
                if (cfg.loader.is(Array)) {
                    cfg.loader.each(function (loader) {
                        System.setLoader(loader);
                    });
                } else {
                    System.setLoader(cfg.loader);
                }
            }
            return;
        } else if (cfg.is(Array)) {
            cfg.each(function (configuration) {
                configure(configuration);
            });
            return;
        }
    }

    throw new Exception(message, 'InvalidConfigurationException');
}

System.getMap = function () {
    return map;
}

Loader.register($root + '.Static', Static);
Loader.register($root + '.reflection.Type', Type);
Loader.register($root + '.reflection.Member', Member);

/**
 * Defines a new class and registers it into the context object.
 *
 * @param className
 *            {String} The name of the member to be defined. It must be a valid
 *            namespace identifier.
 * @param definition
 *            {Object} Contains the public class members.
 */
Loader.register($root + '.Class', Class);

// System.Namespace = Namespace;
Loader.register($root + '.Namespace', Namespace);

System.setGlobal(System);

/**
 * XT roots a temporal System namespace for extensions.
 * */
var xt = new Namespace($root, {});
/**
 * Constructor that creates a new Interface object for checking a function implements the required methods.
 * @param name | String | the instance name of the Interface
 * @param body | Array | methods that should be implemented by the relevant function
 */
function Interface(/*[Member]*/) {
    var classpath = arguments[0], definition = arguments[1], def = apply({}, definition), $iface;
    if (this.is(Interface)) {
        if (arguments.callee.caller == Interface) { //Instantiation of classes objects)
            var context = this, CustomType = eval("CustomType = function " + classpath + "(/*[Interface]*/){ return context; }"), base, actions = '$actions' in definition ? definition['$actions'] : definition || [];

            if ('$extends' in def) {
                switch (typeof def['$extends']) {
                    case 'string':
                        def['$extends'] = Loader.using(def['$extends']);
                        if (!def['$extends'] || !isFunction(def['$extends'])) {
                            //if () throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(def['$extends'])['constructor']['name']);
                            throw new Exception('The super class definition was unresolved', "UnresolvedSuperClassException");
                        }
                    case 'function':
                        base = def['$extends'];
                        delete def['$extends'];
                        break;
                    default:
                        throw new Exception("Invalid super type, cannot be an instance of: " + Object.getPrototypeOf(def['$extends'])['constructor']['name'], "InvalidSuperClassException");
                }
            }
            if (isObject(actions) && !isArray(actions)) {
                var aux = [];
                for (var i in actions) {
                    if (hasProp(actions, i) && isFunction(actions[i])) {
                        aux.push(i);
                    }
                }
                actions = aux;
            }

            $iface = (function () {
                var func;
                eval("func = function " + classpath + "(/*[Interface]*/){}");
                return func;
            })();

            if (base) {
                define($iface, new (define(CustomType, base.prototype))(), undefined, {
                    '$superclass': base
                });
            } else {
                define($iface, context);
            }

            if (System.isObject(actions)) {
                $iface.$actions = [];

                // Loop through provided arguments and add them to the 'methods' array
                for (var i = 0, len = actions.length; i < len; i++) {
                    // Check the method name provided is written as a String
                    if (!isString(actions[i])) {
                        throw new System.exception.InvalidArgumentException("Interface constructor expects method names to be passed in as a string.");
                    }

                    // If values is as required then add the provided method name to the method array
                    $iface.$actions.push(actions[i]);
                }

                delete definition['$actions'];
            }

            Member.call(this, classpath, undefined, Interface);

            this.getAllMethods = function () {
                var methods = [];
                var $super = this;

                while ($super = $super.$superclass) {
                    $super.getAllMethods().each(function (method) {
                        methods.push(method);
                    });
                }

                this.getDeclaredMethods().each(function (method) {
                    methods.push(method);
                });
                return methods;
            }

            this.getDeclaredMethods = function () {
                var methods = [];
                for (var m in def)
                    if (hasProp(def, m) && typeof def[m] == 'function') {
                        var method = def[m];
                        apply(method, {'name': m});
                        methods.push(method);
                    }
                return methods;
            }

            this.is = function (subject) {
                var _isIt = false;
                if (isFunction(subject)) {
                    if (is(context, subject)) return true;
                    else if (subject.prototype.is(System.Interface)) {
                        context.getInterfaces().each(function (iface) {
                            if (iface.is(subject)) return _isIt = true;
                        });
                    }
                }
                return _isIt;
            }

            $iface = apply($iface, this);

            apply($iface.prototype, def, {
                'getClass': function () {
                    return $iface;
                }
            });

            return $iface;
        }
    } else {
        if (classpath && classpath.is(String)) {
            if (arguments.length > 2) {
                throw new Exception("Invalid arguments number, expected 1 or 2", "InvalidArgumentsException");
            }

            var ns = new Namespace(classpath, def['$container']),
                name = ns.getName(), container = ns.getParent();

            delete def['$container'];

            try {
                $iface = new Interface(name, def);
                return Member.register(container.addMember($iface));
            } catch (e) {
                var unresolved = [];
                switch (e.name) {
                    case "UnresolvedSuperClassException":
                        if ("$extends" in definition) {
                            unresolved.push(definition['$extends']);
                        }

                        var builderTemp = new Member.BuilderTemp(name, e);
                        Loader.observe(unresolved, function (error) {
                            if (!error) {
                                var cls = Interface(classpath, definition);
                                return builderTemp.onBuild(cls);
                            }
                        });
                        return builderTemp;
                    default:
                        throw e;
                }
            }
        }
        throw new Exception("Invalid arguments provided, expected (String[, Object]).", "InvalidArgumentsException");
    }
    throw new Exception("Cannot explicitly create Interface instances.", "IllegalCallException");
}

System.Interface = define(Interface, Member, undefined, {
    'ensureImplements': function ($class) {
        // Check that the right amount of arguments are provided
        if (arguments.length < 2) {
            throw new Exception("Interface.ensureImplements was called with " + arguments.length + "arguments, but expected at least 2.", "InvalidArgumentsException");
        }

        // Loop through provided arguments (notice the loop starts at the second argument)
        // We start with the second argument on purpose so we miss the data object (whose methods we are checking exist)
        for (var i = 1, len = arguments.length; i < len; i++) {
            // Check the object provided as an argument is an instance of the 'Interface' class
            var $iface = arguments[i];
            if (!$iface.is(Interface)) {
                throw new Exception("ensureImplements expects the second argument to be an instance of the 'Interface' constructor.", "InvalidArgumentsException");
            }

            // Otherwise if the provided argument IS an instance of the Interface class then
            // loop through provided arguments (object) and check they implement the required methods
            var methods = $iface.getClass().getAllMethods();
            for (var j = 0, methodsLen = methods.length; j < methodsLen; j++) {

                var method = methods[j];

                // Check method name exists and that it is a function (e.g. test[getTheDate])

                // if false is returned from either check then throw an error
                if (!$class.prototype[method.name] || !isFunction($class.prototype[method.name])) {
                    throw new Exception("'" + $class.getFullPath() + "' does not implement interface member '" + $iface.getFullPath() + "." + method.name + "(" + getSignature(method) + ")'.", "NotImplementedException");
                }
            }
        }
    }
});

Loader.register($root + '.Interface', Interface);

// Class("Interface", {
//     '$extends': 'System.Member',
//     '$static': {
//         'ensureImplements': function ($class) {
//             // Check that the right amount of arguments are provided
//             if (arguments.length < 2) {
//                 throw new Error("Interface.ensureImplements was called with " + arguments.length + "arguments, but expected at least 2.");
//             }
//
//             // Loop through provided arguments (notice the loop starts at the second argument)
//             // We start with the second argument on purpose so we miss the data object (whose methods we are checking exist)
//             for (var i = 1, len = arguments.length; i < len; i++) {
//                 // Check the object provided as an argument is an instance of the 'Interface' class
//                 var $iface = arguments[i];
//                 if (!$iface.is(Interface)) {
//                     throw new System.exception.InvalidArgumentException("ensureImplements expects the second argument to be an instance of the 'Interface' constructor.");
//                 }
//
//                 // Otherwise if the provided argument IS an instance of the Interface class then
//                 // loop through provided arguments (object) and check they implement the required methods
//                 var methods = $iface.getClass().getAllMethods();
//                 for (var j = 0, methodsLen = methods.length; j < methodsLen; j++) {
//
//                     var method = methods[j];
//
//                     // Check method name exists and that it is a function (e.g. test[getTheDate])
//
//                     // if false is returned from either check then throw an error
//                     if (!$class.prototype[method.name] || !isFunction($class.prototype[method.name])) {
//                         throw new Error("Class '" + $class.getFullPath() + "' does not implements the '" + $iface.constructor.getName() + "' interface correctly. The method '" + method.name + "' was not found.");
//                     }
//                 }
//             }
//         }
//     },
//     'constructor': function Interface(/*[Member]*/) {
//         var classpath = arguments[0], definition = arguments[1], def = apply({}, definition), $iface;
//         if (this.is(Interface)) {
//             if (arguments.callee.caller == Interface) { //Instantiation of classes objects)
//                 var context = this, CustomType = eval("CustomType = function " + classpath + "(/*[Interface]*/){ return context; }"), base, actions = '$actions' in definition ? definition['$actions'] : definition || [];
//
//                 if ('$extends' in def) {
//                     switch (typeof def['$extends']) {
//                         case 'string':
//                             def['$extends'] = Loader.using(def['$extends']);
//                             if (!def['$extends'] || !isFunction(def['$extends'])) {
//                                 //if () throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(def['$extends'])['constructor']['name']);
//                                 throw new Exception('The super class definition was unresolved', "UnresolvedSuperClassException");
//                             }
//                         case 'function':
//                             base = def['$extends'];
//                             delete def['$extends'];
//                             break;
//                         default:
//                             throw new Exception("Invalid super type, cannot be an instance of: " + Object.getPrototypeOf(def['$extends'])['constructor']['name'], "InvalidSuperClassException");
//                     }
//                 }
//                 if (isObject(actions) && !isArray(actions)) {
//                     var aux = [];
//                     for (var i in actions) {
//                         if (hasProp(actions, i) && isFunction(actions[i])) {
//                             aux.push(i);
//                         }
//                     }
//                     actions = aux;
//                 }
//
//                 var $iface = (function () {
//                     var func;
//                     eval("func = function " + classpath + "(/*[Interface]*/){}");
//                     return func;
//                 })();
//
//                 if (base) {
//                     define($iface, new (define(CustomType, base.prototype))(), undefined, {
//                         '$superclass': base
//                     });
//                 } else {
//                     define($iface, context);
//                 }
//
//                 if (System.isObject(actions)) {
//                     $iface.$actions = [];
//
//                     // Loop through provided arguments and add them to the 'methods' array
//                     for (var i = 0, len = actions.length; i < len; i++) {
//                         // Check the method name provided is written as a String
//                         if (!isString(actions[i])) {
//                             throw new System.exception.InvalidArgumentException("Interface constructor expects method names to be passed in as a string.");
//                         }
//
//                         // If values is as required then add the provided method name to the method array
//                         $iface.$actions.push(actions[i]);
//                     }
//
//                     delete definition['$actions'];
//                 }
//
//                 $iface = apply($iface, Class.call(this, classpath, def));
//
//                 apply($iface.prototype, def, {
//                     'getClass': function () {
//                         return $iface;
//                     }
//                 });
//
//                 return $iface;
//             }
//         } else {
//             if (classpath && classpath.is(String)) {
//                 if (arguments.length > 2) {
//                     throw new Exception("Invalid arguments number, expected 1 or 2", "InvalidArgumentsException");
//                 }
//
//                 var ns = new Namespace(classpath, def['$container']),
//                     name = ns.getName(), container = ns.getParent();
//
//                 delete def['$container'];
//
//                 try {
//                     $iface = new Interface(name, def);
//                     return Member.register(container.addMember($iface));
//                 } catch (e) {
//                     var unresolved = [];
//                     switch (e.name) {
//                         case "UnresolvedSuperClassException":
//                             if ("$extends" in definition) {
//                                 unresolved.push(definition['$extends']);
//                             }
//
//                             var builderTemp = new Member.BuilderTemp(name, e);
//                             Loader.observe(unresolved, function (error) {
//                                 if (!error) {
//                                     var cls = Interface(classpath, definition);
//                                     return builderTemp.onBuild(cls);
//                                 }
//                             });
//                             return builderTemp;
//                         default:
//                             throw e;
//                     }
//                 }
//             }
//             throw new Exception("Invalid arguments provided, expected (String[, Object]).", "InvalidArgumentsException");
//         }
//         throw new Exception("Cannot explicitly create Interface instances.", "IllegalCallException");
//     }
// });
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
    return _stime - (new Date().getMilliseconds());
}
})
();