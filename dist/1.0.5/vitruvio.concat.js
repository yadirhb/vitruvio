/**
 * @module vitruvio
 * @version 1.0.5
 * @description Framework which extends JavaScript capabilities in order to allow developing OOP applications over an structural well designed architecture by defining: namespaces, classes, interfaces, enumerators, inheritance, exceptions and other resources.
 * @author Yadir Hernandez <yadirhb@gmail.com>
 * @released 2016-11-11
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
                var args = Array.prototype.concat.apply([null], arguments[1] || this.constructor.arguments);
                var $type = new (Function.prototype.bind.apply(type, args));
                var context = this, proto = Object.getPrototypeOf(type.prototype);
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
                if (listener && listener.listener) {
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
/**
 *  Global namespace definition
 */
var $root = "System", System = $global[$root] || {'$global': $global}, $original = $global[$root];
var validIdientifierRegex = /^@?[a-z_A-Z]\w+(?:\.@?[a-z_A-Z]\w+)*$/;

/**
 * Parent class for inheritance into the System.
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

                    Array.prototype.slice.call(arguments, 1, arguments.length).each(function (arg) {
                        if (arg && arg.is(Member.BuilderTemp)) {
                            arg.onBuild = function (member) {
                                updateContainer(member, ns);
                            }
                        }
                        else updateContainer(arg, ns);
                    });
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

            if (node in container && container[node]) {
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

        this.loaded = false;

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

            dependency.each(function (dep, i) {
                if (dep in map) {
                    if (requests.indexOf(map[dep]) == -1) {
                        requests[i] = map[dep];
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
                            dependency.each(function (dep, i) {
                                if (requests.indexOf(map[dep]) == -1) requests[i] = map[dep];
                            })
                        }
                        try {
                            return callback.apply(caller, requests);
                        } catch (e) {
                            throw new System.exception.RuntimeException("Execution failed during callback " + (e ? "because of: <" + e.message + ">" : ""));
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
                                    if (requests.indexOf(map[classpath]) == -1) requests[dependency.indexOf(classpath)] = map[classpath];
                                } else if (module && module.is(DependencyRequest) && module.loaded) {
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
            var context = this, $super, constructor, $ifaces = [], CustomType;
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
                        $super = def['$extends'];
                        delete def['$extends'];
                        break;
                    default:
                        throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(def['$extends'])['constructor']['name']);
                }

                if (constructor == undefined) constructor = $super;
            }

            if (constructor == undefined) constructor = CustomType;

            var $class = (function ($super) {
                var func;

                function construct() {
                    if ($super) {
                        this.$super = $super;
                    }
                    constructor.apply(this, arguments);
                    if (isFunction($super)) {
                        this.$super = this.as($super);
                    }
                    return this;
                }

                eval("func = function " + classpath + "(/*[Class]*/){ construct.apply(this, arguments); }");
                return func;
            })($super);

            var cleanDef = removeKeyWords(def);

            if ($super) {
                define($class, new (define(CustomType, $super.prototype))(), undefined, {
                    '$superclass': $super
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

        return Class(arguments[0], apply(def, {'$static': removeKeyWords(args)}));
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
System.hasProp = hasProp;
System.getOwn = getOwn;
System.freeze = freeze;
System.alias = alias;
System.bind = bind;
System.apply = apply;
System.mixin = mixin;

System.setGlobal = function (/*Namespace*/) {
    return CONFIG.GLOBAL = arguments[0] || CONFIG.GLOBAL;
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

            if (cfg.sourcesSet) {
                if (cfg.sourcesSet.is(Array)) {
                    System.Router.sourcesSet = cfg.sourcesSet;
                } else if (cfg.sourcesSet.is(String)) {
                    System.Router.sourcesSet.push(cfg.sourcesSet);
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
var Environment = Static.Class('Environment', {
    'isBrowser': isBrowser,
    'isDesktop': isDesktop,
    'isMobile': isMobile,
    'isNode': isNode,
    'getInfo': function () {
        return !this.prototype.info ? this.prototype.info = {
            'environment': this.getEnvironment(),
            'client': this.getClient()
        } : this.prototype.info;
    },
    'getPlatform': function () {
        if (!this.prototype.platform) {
            this.prototype.platform = this.isBrowser() ? 'browser' : this.isNode() ? 'desktop' : undefined;
        }
        return this.prototype.platform;
    },
    'getEnvironment': function () {
        if (!this.prototype.env) {
            if (this.isBrowser()) {
                this.prototype.env = 'browser';
            } else if (this.isDesktop()) {
                this.prototype.env = 'desktop';
            } else if (this.isMobile()) {
                this.prototype.env = 'mobile';
            }
        }
        return this.prototype.env;
    },
    'getClient': function () {
        if (!this.prototype.client) {
            if (this.isBrowser()) {
                var userAgent = System.utils.UserAgent;
                if (userAgent.isChrome()) this.prototype.client = "chrome";
                else if (userAgent.isFirefox()) this.prototype.client = "firefox";
                else if (userAgent.isSafari()) this.prototype.client = "safari";
                else if (userAgent.isOpera()) this.prototype.client = "opera";
                else if (userAgent.isIE()) this.prototype.client = "ie";
                else if (userAgent.isEdge()) this.prototype.client = "edge";
                else if (userAgent.isBlink()) this.prototype.client = "blink";
            } else if (this.isNode()) {
                this.prototype.client = "node";
            }
        }

        return this.prototype.client;
    }
});
/**
 * Created by yadirhb on 2/17/2016.
 *
 * EventEmitter v4.2.11 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */
Class('EventEmitter', {
    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    'getListeners' : function(evt) {
        return getListeners.apply(this, arguments);
    },
    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    'flattenListeners' : function(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    },
    /**
    * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
    *
    * @param {String|RegExp} evt Name of the event to return the listeners from.
    * @return {Object} All listener functions for an event in an object.
    */
    'getListenersAsObject' : function(evt) {
        return getListenersAsObject.apply(this, arguments);
    },
    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to values events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'addListener' : function(evt, listener) {
        return addListener.apply(this, arguments);
    },
    /**
     * Alias of addListener
     */
    'on': function(){
        return addListener.apply(this, arguments);
    },
    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'addOnceListener' : function(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    },
    /**
     * Alias of addOnceListener.
     */
    'once' : function(){
        return this['addOnceListener'].apply(this,arguments);
    },
    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'defineEvent' : function(evt) {
        return defineEvent.apply(this, arguments);
    },
    /**
     * Uses _defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'defineEvents' : function(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    },
    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from values events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'removeListener' : function(evt, listener) {
        return removeListener.apply(this, arguments);
    },
    /**
     * Alias of removeListener
     */
    'off' : function(){
        return removeListener.apply(this, arguments);
    },
    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to values events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'addListeners' : function(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    },
    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from values events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'removeListeners' : function(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    },
    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of values events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'manipulateListeners' : function(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    },
    /**
     * Removes values listeners from a specified event.
     * If you do not specify an event then values listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove values events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove values listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'removeEvent' : function(evt) {
        return removeEvent.apply(this, arguments);
    },
    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    'removeAllListeners' : function(){
        return removeEvent.apply(this, arguments);
    },
    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to values events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'emitEvent' : function(evt, args) {
        return emitEvent.apply(this, arguments);
    },
    /**
     * Alias of emitEvent
     */
    'trigger' : function(){
        return emitEvent.apply(this, arguments);
    },
    /**
     * Subtly different from _emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to values events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'emit' : function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    },
    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    'setOnceReturnValue' : function(value) {
        this._onceReturnValue = value;
        return this;
    }
})
/**
 * Manage events between components.
 */
Static.Class('EventManager', {
    /**
     *
     * @param target
     * @param eventName
     * @param listener
     * @param useCapture
     * @returns Target object for chaining.
     */
    'addEventListener': function (target, eventName, listener, useCapture) {
        if (target instanceof System.EventEmitter) {
            target.on(eventName, listener, useCapture);
        } else if (target instanceof Element) {
            var ver = System.utils.UserAgent.IE.getVersion();
            if (ver != -1 && ver < 11) {
                target.attachEvent("on" + eventName, listener, useCapture);
            } else target.addEventListener(eventName, listener, useCapture);
        }
        return target;
    },
    /**
     *
     * @param target
     * @param eventName
     * @param listener
     * @returns Target object for chaining.
     */
    'removeEventListener': function (target, eventName, listener) {
        if (target instanceof System.EventEmitter) {
            target.off(eventName, listener);
        } else if (target instanceof Element) {
            var ver = System.utils.UserAgent.IE.getVersion();
            if (ver != -1 && ver < 11) {
                target.detachEvent("on" + eventName, listener);
            } else target.removeEventListener(eventName, listener);
        }

        return target;
    }
})
/**
 * Exception class
 * Represents errors that occur during application execution.
 */
Class('Exception', {
    '$extends': Error,
    'constructor': Exception,
    //we should define how our toString function works as this will be used internally
    //by the browser's stack trace generation function
    'toString': function () {
        return "[" + this.name + "] : " + this.message;
    }
});
/**
 * A resource loader is an object that is responsible for loading resources. The class Loader is an abstract class. Given the name of a resource, a resource loader should attempt to locate or generate data that constitutes a definition for the resource. A typical strategy is to transform the name into a file name and then read a "resource file" of that name from a file system.
 */
Class('runtime.Loader', {
    'constructor': function (config) {
        apply(this, config);
    },
    'defineClass': function (name, body) {
    },
    'defineNamespace': function (name) {
    },
    /**
     * Finds the resource with the given name.
     * @param name The name of the resource
     */
    'find': function (name) {
        return map[name];
    },
    /**
     *
     * @param deps
     * @param callback
     * @param async
     * @returns {*}
     */
    'load': function load(deps, callback, async) {
        async = async || (true === async);
        try {
            if (Environment.isBrowser()) {
                return System.runtime.BrowserLoader.load.call(this, deps, callback, async);
            } else if (Environment.isNode()) {
                return System.runtime.NodeLoader.load.call(this, deps, callback, async);
            }
        } catch (e) {
            return new DependencyRequest(deps, e);
        }
    },
    'cancelLoad': function (dependency, callback, force) {
    }
})
/*System.RegExp = create(function RegExp(){},{
	'Namespace' : /^@?[a-z_A-Z]\w+(?:\.@?[a-z_A-Z]\w+)*$/,
	"Identifier" : /^[\p{L}\p{Nl}$_][\p{L}\p{Nl}$\p{Mn}\p{Mc}\p{Nd}\p{Pc}]*$/
}, new RegExp());*/
/**
 * Created by yadirhb on 9/30/2016.
 */
var path_module;
if (Environment.isNode()) {
    path_module = require('path');
}
Static.Class('Router', {
    'sourcesSet': ["src/"],
    'getBaseDir': function () {
        if (!System.Router.baseDir) {
            if (Environment.isNode()) {
                return path_module.normalize(path_module.resolve(__dirname + "../../../"));
            } else if (Environment.isBrowser()) {
                return "./";
            }
        }

        return System.Router.baseDir;
    },
    'relativize': function (relDir, base) {
        base = base || this.getBaseDir();

        if (Environment.isNode()) {
            return path_module.normalize(path_module.resolve(base + relDir));
        }
    },
    'getSourcesSet': function () {
        return System.Router.sourcesSet;
    }
})
if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/25/2016.
     */
    Class('dom.BaseElement', {
        'append': function () {
            var self = this;
            if (this instanceof Element) each(arguments, function (child) {
                if (child instanceof Element) self.appendChild(child);
            });
            return this;
        },
        'bind': function (eventType, listener) {
            return System.EventManager.addEventListener(this, eventType, listener);
        },
        'css': function (prop, value) {
            if (System.isString(prop) && this instanceof Element) this.style[prop] = value;
            else if (System.isObject(prop) && !System.isFunction(prop)) {
                System.apply(this.style, prop);
            }
            return this;
        },
        'unbind': function (eventType, listener) {
            return System.EventManager.removeEventListener(this, eventType, listener);
        },
        'hide': function () {
            if (this instanceof Element) this.style.visibility = "hidden";
        },
        'show': function () {
            if (this instanceof Element) this.style.visibility = "visible";
        },
        'remove': function () {
            if (this instanceof Element) return this.parentNode.removeChild(this);
        }
    })
}
if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/25/2016.
     */
    Static.Class('dom.Browser', {
        'scrollTop': function () {
            var doc = document.documentElement;
            return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        },
        'scrollLeft': function () {
            var doc = document.documentElement;
            return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        }
    })
}
if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/25/2016.
     */
    Static.Class('dom.DOMManager', {
        'apply': function (target) {
            return System.mixin(target, Object.getPrototypeOf(new System.dom.BaseElement));
        },
        'getScripts': function () {
            return scripts();
        }
    })

    System.$ = System.dom.DOMManager.apply;
}
/**
 * Created by yadirhb on 12/15/2015.
 */
Class('exception.IllegalCallException',{
    '$extends' : 'System.Exception',
    'constructor': function (message) {
        this.$super(message || "Default exception if a function was called while the object is not in a valid state for that function.");
    }
})

/**
 * The exception that is thrown when one of the arguments provided to a method is not valid.
 */
Class('exception.InvalidArgumentsException', {
    '$extends': 'System.Exception',
    'constructor': function (message) {
        this.$super(message);
    }
})

/**
 * Created by yadirhb on 5/2/2016.
 */
Class('exception.InvalidInterfaceException', {
    '$extends' : 'System.Exception',
    'constructor': function (name) {
        this.$super("Unknown interface"+(name ? "named: " + name : ""));
    }
})
/**
 * Created by yadirhb on 12/15/2015.
 */
Class('exception.InvalidStateException',{
    '$extends' : 'System.Exception',
    'constructor': function (message) {
        this.$super(message || "Default exception if a function was called while the object is not in a valid state for that function.");
    }
})

/**
 * Created by yadirhb on 5/2/2016.
 */
Class('exception.InvalidSuperClassException', {
    '$extends' : 'System.Exception',
    'constructor': function (name) {
        this.$super("Invalid super class type"+(name ? ", cannot be an instance of: " + name : ""));
    }
})
/**
 * Created by yadirhb on 12/15/2015.
 */
Class('exception.InvalidTypeException',{
    '$extends' : 'System.Exception',
    'constructor': function (message) {
        this.$super(message || "Default exception if a function was called while the object is not in a valid state for that function.");
    }
})

/**
 * Created by yadirhb on 11/11/2016.
 */
Class('exception.RuntimeException', {
    '$extends' : 'System.Exception',
    'constructor': function (message) {
        this.$super(message || "Execution failed");
    }
})
/**
 * Created by yadirhb on 2/17/2016.
 */
Class('exception.TimeoutException', {
    '$extends' : 'System.Exception',
    'constructor': function (message) {
        this.$super(message || "Operation timeout.");
    }
})
if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/17/2016.
     */
    Class('exception.UnsupportedCORSException', {
        '$extends': 'System.Exception',
        'constructor': function (message) {
            this.$super(message || "Your browser doesn't support CORS connections.");
        }
    })
}
if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/17/2016.
     */
    Class('exception.UnsupportedWebSocketException', {
        '$extends': 'System.Exception',
        'constructor': function (message) {
            this.$super(message || "Your browser doesn't support WebSocket connections.");
        }
    })
}
if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/17/2016.
     */
    Class('network.AjaxClient', {
        '$extends': 'System.network.BaseClient',
        '$static': {
            /**
             *  Returns the scheme for build an url.
             * */
            'getURLSchema': function (secure) {
                return (secure ? "https://" : "http://");
            }
        },
        'constructor': function (config) {
            this.$super(config.url, config.protocol);
            var self = this;

            var xhr = (function () {
                var userAgent = System.utils.UserAgent;
                if (userAgent.isIE() && userAgent.IE.getVersion() == 8 || userAgent.IE.getVersion() == 9) return new XDomainRequest();
                else if ($global.XMLHttpRequest) return new XMLHttpRequest();
                else return;
            })();

            try {
                xhr.open(config.method || "POST", this.url, true);
                self.trigger('open');
            } catch (e) {
                xhr = undefined;
            }

            // The browser doesn't support CORS
            if (!xhr) throw new System.exception.UnsupportedCORSException();

            xhr.timeout = config.timeout;

            if (config.responseType === 'binary') {
                // new browsers (XMLHttpRequest2-compliant)
                if ('responseType' in xhr) {
                    xhr.responseType = 'arraybuffer';
                }
                // old browsers (XMLHttpRequest-compliant)
                else if ('overrideMimeType' in xhr) {
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
            }

            xhr.onerror = function (e) {
                self.trigger('error', [e || new System.Exception("Unknown error.")]);
            };

            xhr.ontimeout = function () {
                self.trigger('error', [new System.exception.TimeoutException()]);
            }

            var notified = false;

            function notifyResponse(e) {
                if (!notified) {
                    if (!('response' in this)) {
                        try {
                            this.response = this.responseText;
                        } catch (e) {
                        }
                    }
                    self.trigger('message', [mixin(e, {'data': this.response})]);
                    notified = true;
                }
            }

            xhr.onreadystatechange = function readystatechange(e) {
                if (this.readyState == 4 && this.status == 200) {
                    notifyResponse.call(this, e);
                }
            }

            xhr.onload = function (e) {
                notifyResponse.call(this, e);
            }

            xhr.onabort = function (e) {
                self.trigger('close', [mixin(e, {'code': this.code, 'reason': this.reason})]);
            }

            this.agent = xhr;
        },
        'getReadyState': function () {
            return this.agent ? this.agent.readyState : 0;
        },
        'send': function (data) {
            try {
                if (this.agent) {
                    this.agent.send(data);
                    return;
                }
            } catch (e) {
            }
            throw new System.exception.InvalidStateException("Cannot perform send while the connection is not open.");
        },
        'close': function (code, reason) {
            try {
                if (this.agent) {
                    this.agent.code = code;
                    this.agent.reason = reason;
                    this.agent.abort();
                    return;
                }
            } catch (e) {
            }
            throw new System.exception.InvalidStateException("Cannot perform close while the connection is not open.");
        }
    });
}
/**
 * Created by yadirhb on 2/17/2016.
 *
 * Base class for extending all network implementations. This is a suitable interface to standardize.
 *
 * @event open
 *      This event occurs when socket connection is established.
 * @event message
 *      This event occurs when client receives data from server.
 * @event error
 *      This event occurs when there is any error in communication.
 * @event close
 *      This event occurs when connection is closed.
 */
Class('network.BaseClient', {
    '$extends' : 'System.EventEmitter',
    'constructor': function (url, protocol) {
        this.url = url;
        this.protocol = protocol;

        this.defineEvents(["open","message","error","close"]);
    },
    /**
     * Represents the state of the connection. It can have the following values:
     *      0 indicates that the connection has not yet been established.
     *      1 indicates that the connection is established and communication is possible.
     *      2 indicates that the connection is going through the closing handshake.
     *      3 indicates that the connection has been closed or could not be opened.
     * */
    'getReadyState' : function(){
        throw new System.Exception("Implement this method into " + this.getClass().$name);
    },
    /**
     * The send(data) method transmits data using the connection.
     * */
    'send':function(data){
        throw new System.Exception("Implement this method into " + this.getClass().$name);
    },
    /**
     * The close() method would be used to terminate any existing connection.
     * @param code Optional
     *      A numeric value indicating the status code explaining why the connection is being closed. If this parameter
     * is not specified, a default value of 1000 (indicating a normal "transaction complete" closure) is assumed. See
     * the list of status codes on the CloseEvent page for permitted values.
     * @param  reason Optional
     *      A human-readable string explaining why the connection is closing. This string must be no longer than 123 bytes
     * of UTF-8 text (not characters).
     * */
    'close' : function(code, reason){
        throw new System.Exception("Implement this method into " + this.getClass().$name);
    }
})
if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/17/2016.
     */
    Class('network.WebSocketClient', {
        '$extends': 'System.network.BaseClient',
        '$static': {
            /**
             *  Returns the scheme for build an url.
             * */
            'getURLSchema': function (secure) {
                return (secure ? "wss://" : "ws://");
            }
        },
        'constructor': function (config) {
            this.$super(config.url, config.protocol);
            var self = this;
            if ("WebSocket" in $global) {
                try {
                    // Let us open a web socket
                    var connection = new WebSocket(this.url, this.protocol);

                    // Log errors
                    connection.onerror = function (e) {
                        self.trigger('error', [e || new System.Exception("Unknown error.")]);
                    }

                    // When the connection is open, send some data to the server
                    connection.onopen = function (e) {
                        self.trigger('open', [e]);
                    }

                    // Log messages from the server
                    connection.onmessage = function (e) {
                        self.trigger('message', [e]);
                    }

                    connection.onclose = function (e) {
                        // websocket is closed.
                        self.trigger('close', [apply(e, {'code': this.code, 'reason': this.reason})]);
                    }

                    this.agent = connection;
                } catch (e) {
                    self.trigger('error', [e || new System.Exception("Unknown error.")]);
                }
            } else {
                // The browser doesn't support WebSocket
                throw new System.exception.UnsupportedWebSocketException();
            }
        },
        'getReadyState': function () {
            return this.agent ? this.agent.readyState : 0;
        },
        'send': function (data) {
            try {
                if (this.agent) {
                    this.agent.send(data);
                    return;
                }
            } catch (e) {
            }
            throw new System.exception.InvalidStateException("Cannot perform send while the connection is not open.");
        },
        'close': function (code, reason) {
            try {
                if (this.agent) {
                    this.agent.code = code;
                    this.agent.reason = reason;
                    this.agent.close(code, reason);
                    return;
                }
            } catch (e) {
                throw e || new System.exception.InvalidStateException("Cannot perform close while the connection is not open.");
            }
        }
    })
}
/**
 * Constructor that creates a new Enumerator object for checking a function implements the required methods.
 * @param objectName | String | the instance name of the Enumerator
 * @param methods | Array | methods that should be implemented by the relevant function
 */
function Enumerator(/*[Type]*/) {
    var classpath = arguments[0], definition = arguments[1], def = apply(isArray(definition) ? [] : {}, definition), $enum;
    if (this.is(Enumerator)) {
        if (arguments.callee.caller == Enumerator) { //Instantiation of classes objects)
            var context = this, CustomType = eval("CustomType = function " + classpath + "(/*[Enumerator]*/){ return context; }"), values = '$values' in def ? def['$values'] : def || [];

            delete def['$values'];

            $enum = (function () {
                var func;
                eval("func = function " + classpath + "(/*[Enumerator]*/){}");
                return func;
            })();

            define($enum, context);

            // prepare a 'self' object to return, so we work with an object instead of a function
            $enum.values = [];     // prepare a list of values indices

            if (isArray(values)) {
                $enum.keys = values; // create the list of values keys

                values.each(function (val, i) {
                    $enum[val] = i;
                    $enum.values.push(i);
                });

            } else if (!isFunction(values) && isObject(values)) {
                $enum.keys = [];
                for (var i in values) {
                    if (values.hasOwnProperty(i)) {
                        if (!isFunction(values[i])) {
                            $enum.keys.push(i);
                            $enum.values.push(values[i]);     // add the index to the list of values indices
                        }
                        $enum[i] = values[i]; // add the variable to this object
                    }
                }
            }

            Member.call($enum.prototype, classpath, undefined, Interface);

            $enum = apply($enum, this, clsMembers);

            var cleanDef = removeKeyWords(def);

            apply($enum.prototype, cleanDef, {
                '$class': $enum,
                '$def': cleanDef
            });

            return $enum;
        }
    } else {
        if (classpath && classpath.is(String)) {
            if (arguments.length > 2) {
                throw new System.exception.InvalidArgumentsException("Invalid arguments number, expected 1 or 2");
            }

            var ns = new Namespace(classpath, def['$container']),
                name = ns.getName(), container = ns.getParent();

            delete def['$container'];

            try {
                $enum = new Enumerator(name, def);
                return Member.register(container.addMember($enum));
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
    throw new System.exception.IllegalCallException("Cannot explicitly create Interface instances.");
}

Loader.register($root + '.reflection.Enumerator', define(Enumerator, Member, {
    'contains': function (val) {
        return this.valueOf(val) != undefined;
    },
    'valueOf': function (val) {
        if (this.keys) {
            for (var i in this) {
                if (!isFunction(this[i]) && this[i] == val) return this[i];
            }
        }
    }
}))

Loader.register($root + '.Enum', function () {
    return Enumerator.apply(arguments.callee, arguments);
});
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
                        throw new System.exception.InvalidArgumentsException("Interface constructor expects method names to be passed in as a string.");
                    }

                    // If values is as required then add the provided method name to the method array
                    $iface.$actions.push(actions[i]);
                }

                delete definition['$actions'];
            }

            Member.call($iface.prototype, classpath, undefined, Interface);

            $iface = apply($iface, this, clsMembers);

            var cleanDef = removeKeyWords(def);

            apply($iface.prototype, cleanDef, {
                '$class': $iface,
                '$def': cleanDef
            });

            return $iface;
        }
    } else {
        if (classpath && classpath.is(String)) {
            if (arguments.length > 2) {
                throw new System.exception.InvalidArgumentsException("Invalid arguments number, expected 1 or 2");
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
    throw new System.exception.IllegalCallException("Cannot explicitly create Interface instances.");
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
            var methods = $iface.$class.getAllMethods();
            for (var j = 0, methodsLen = methods.length; j < methodsLen; j++) {

                var method = methods[j], name = method.getName();

                // Check method name exists and that it is a function (e.g. test[getTheDate])

                // if false is returned from either check then throw an error
                if (!(name in $class['prototype']) || !isFunction($class['prototype'][name])) {
                    throw new Exception("'" + $class.getFullPath() + "' does not implement interface member '" + $iface.getFullPath() + "." + method.getSignature() + "'.", "NotImplementedException");
                }
            }
        }
    }
});

Loader.register($root + '.Interface', Interface);
/**
 * Created by yadirhb on 3/23/2016.
 */
Class('reflection.Method', {
    'constructor': function (name, func) {
        Member.call(this, System.reflection.Method);
        this.getName = function () {
            return name;
        }

        this.getSignature = function () {
            return name + "(" + getSignature(func) + ")";
        }
    }
})
define(System.reflection.Method, Member);
/**
 * Created by yadirhb on 9/24/2016.
 */
if (Environment.isBrowser()) {
    Static.Class('runtime.BrowserLoader', {
        '$extends': 'System.runtime.Loader',
        'load': function load(dependency, callback, async) {
            async = async || (true === async);
            var requests;
            if (dependency) {
                if (dependency.is(Array)) {
                    requests = [];
                    var loaded = [];

                    function onLoad(request) {
                        loaded.push(request);

                        if (loaded.length == dependency.length) {
                            if (callback && callback.is(Function)) {
                                callback(loaded);
                            }
                        }
                    }

                    dependency.each(function (dep) {
                        requests.push(load(dep, onLoad, async));
                    });
                } else {
                    var script = document.createElement("script"), container = document.getElementsByTagName("head")[0];

                    script.setAttribute("type", "text/javascript");
                    script.setAttribute("async", async);

                    System.EventManager.addEventListener(script, 'error', function onError(e) {
                        System.EventManager.removeEventListener(script, 'error', onError);
                        container.removeChild(script);
                        requests = new DependencyRequest(dependency, e);
                        if (callback && callback.is(Function)) {
                            callback(script.querrier);
                        }
                    });

                    if (async) {
                        if (System.utils.UserAgent.isIE()) {  //IE
                            System.EventManager.addEventListener(script, 'readystatechange', function onReadyStateChange() {
                                if (script.readyState == "loaded" ||
                                    script.readyState == "complete") {
                                    System.EventManager.removeEventListener(script, 'readystatechange', onReadyStateChange);

                                    if (callback && callback.is(Function)) {
                                        script.querrier.loaded = true;
                                        callback(script.querrier);
                                    }
                                }
                            });
                        } else {  //Others
                            System.EventManager.addEventListener(script, 'load', function load() {
                                if (callback && callback.is(Function)) {
                                    script.querrier.loaded = true;
                                    callback(script.querrier);
                                }
                            });
                        }
                    }

                    var sourcesSet = System.Router.getSourcesSet();//["/src/"];
                    var baseDir = System.Router.getBaseDir();
                    for (var i = 0; i < sourcesSet.length; i++) {
                        try {
                            var dep = dependency;
                            if (validIdientifierRegex.test(dep)) {
                                dep = baseDir + sourcesSet[i] + dep.replaceAll(".", "/") + '.js';
                            }
                            script.setAttribute("src", dep);
                            requests = new DependencyRequest(dependency, container.appendChild(script));
                            script.querrier = requests;
                            break;
                        } catch (e) {
                            requests = new DependencyRequest(dependency, e);
                        }
                    }
                }
            }
            return requests;
        }
    })
}
/**
 * Created by yadirhb on 9/24/2016.
 */
if (Environment.isNode()) {
    var path = require('path');
    Static.Class('runtime.NodeLoader', {
        'load': function load(dependency, callback) {
            var requests;
            if (dependency) {
                if (dependency.is(Array)) {
                    requests = [];
                    dependency.each(function (dep) {
                        requests.push(load(dep));
                    });
                } else {
                    var sourcesSet = System.Router.getSourcesSet();//["/src/"];
                    var baseDir = System.Router.getBaseDir();
                    for (var i = 0; i < sourcesSet.length; i++) {
                        try {
                            var dep = dependency;
                            if (validIdientifierRegex.test(dep)) {
                                dep = path.normalize(baseDir + "/" + sourcesSet[i] + dep.replaceAll(".", "/"));
                            }
                            requests = new DependencyRequest(dependency, require(dep));
                            requests.loaded = true;
                            break;
                        } catch (e) {
                            requests = new DependencyRequest(dependency, e);
                        }
                    }
                }

                if (callback && callback.is(Function)) {
                    callback(requests);
                }
            }
            return requests;
        }
    })
}
/**
 * Created by yadirhb on 2/18/2016.
 * JXON Snippet #3 - Mozilla Developer Network
 *
 * https://developer.mozilla.org/en-US/docs/JXON
 * https://developer.mozilla.org/User:fusionchess
 *
 * This framework is released under the GNU Public License, version 3 or later.
 * http://www.gnu.org/licenses/gpl-3.0-standalone.html
 */
Static.Class('runtime.serialization.json.JXONParser', {
    'sValProp' : "keyValue",
    'sAttrProp' : "keyAttributes",
    'sAttrsPref' : "@", /* you can customize these values */
    'aCache' : [],
    'parseText' : function parseText (sValue) {
        if (isNullValue(sValue)) { return null; }
        if (isBooleanValue(sValue)) { return sValue.toLowerCase() === "true"; }
        if (isFinite(sValue)) { return parseFloat(sValue); }
        if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
        return sValue;
    },
    'createObjTree' : function createObjTree (oParentNode, nVerb, bFreeze, bNesteAttr) {

        function objectify (vVal) {
            return vVal === null ? new System.runtime.serialization.json.JXONTree() : vVal instanceof Object ? vVal : new vVal.constructor(vVal);
        }

        var
            nLevelStart = this.aCache.length, bChildren = oParentNode.hasChildNodes(),
            bAttributes = oParentNode.hasAttributes && oParentNode.hasAttributes(), bHighVerb = Boolean(nVerb & 2);

        var
            sProp, vContent, nLength = 0, sCollectedTxt = "",
            vResult = bHighVerb ? {} : /* put here the default value for empty nodes: */ true;

        if (bChildren) {
            for (var oNode, nItem = 0; nItem < oParentNode.childNodes.length; nItem++) {
                oNode = oParentNode.childNodes.item(nItem);
                if (oNode.nodeType === 4) { sCollectedTxt += oNode.nodeValue; } /* nodeType is "CDATASection" (4) */
                else if (oNode.nodeType === 3) { sCollectedTxt += oNode.nodeValue.trim(); } /* nodeType is "Text" (3) */
                else if (oNode.nodeType === 1 && !oNode.prefix) { this.aCache.push(oNode); } /* nodeType is "Element" (1) */
            }
        }

        var nLevelEnd = this.aCache.length, vBuiltVal = this.parseText(sCollectedTxt);

        if (!bHighVerb && (bChildren || bAttributes)) { vResult = nVerb === 0 ? objectify(vBuiltVal) : {}; }

        for (var nElId = nLevelStart; nElId < nLevelEnd; nElId++) {
            sProp = this.aCache[nElId].nodeName.toLowerCase();
            vContent = this.createObjTree(this.aCache[nElId], nVerb, bFreeze, bNesteAttr);
            if (vResult.hasOwnProperty(sProp)) {
                if (vResult[sProp].constructor !== Array) { vResult[sProp] = [vResult[sProp]]; }
                vResult[sProp].push(vContent);
            } else {
                vResult[sProp] = vContent;
                nLength++;
            }
        }

        if (bAttributes) {

            var
                nAttrLen = oParentNode.attributes.length,
                sAPrefix = bNesteAttr ? "" : this.sAttrsPref, oAttrParent = bNesteAttr ? {} : vResult;

            for (var oAttrib, nAttrib = 0; nAttrib < nAttrLen; nLength++, nAttrib++) {
                oAttrib = oParentNode.attributes.item(nAttrib);
                oAttrParent[sAPrefix + oAttrib.name.toLowerCase()] = this.parseText(oAttrib.value.trim());
            }

            if (bNesteAttr) {
                if (bFreeze) { Object.freeze(oAttrParent); }
                vResult[this.sAttrProp] = oAttrParent;
                nLength -= nAttrLen - 1;
            }

        }

        if (nVerb === 3 || (nVerb === 2 || nVerb === 1 && nLength > 0) && sCollectedTxt) {
            vResult[this.sValProp] = vBuiltVal;
        } else if (!bHighVerb && nLength === 0 && sCollectedTxt) {
            vResult = vBuiltVal;
        }

        if (bFreeze && (bHighVerb || nLength > 0)) { Object.freeze(vResult); }

        this.aCache.length = nLevelStart;

        return vResult;
    },
    'loadObjTree' : function loadObjTree (oXMLDoc, oParentEl, oParentObj) {

        var vValue, oChild;

        if (oParentObj.constructor === String || oParentObj.constructor === Number || oParentObj.constructor === Boolean) {
            oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 or 1 */
            if (oParentObj === oParentObj.valueOf()) { return; }
        } else if (oParentObj.constructor === Date) {
            oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toGMTString()));
        }

        for (var sName in oParentObj) {
            vValue = oParentObj[sName];
            if (isFinite(sName) || vValue instanceof Function) { continue; } /* verbosity level is 0 */
            if (sName === this.sValProp) {
                if (vValue !== null && vValue !== true) { oParentEl.appendChild(oXMLDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue))); }
            } else if (sName === this.sAttrProp) { /* verbosity level is 3 */
                for (var sAttrib in vValue) { oParentEl.setAttribute(sAttrib, vValue[sAttrib]); }
            } else if (sName.charAt(0) === this.sAttrsPref) {
                oParentEl.setAttribute(sName.slice(1), vValue);
            } else if (vValue.constructor === Array) {
                for (var nItem = 0; nItem < vValue.length; nItem++) {
                    oChild = oXMLDoc.createElement(sName);
                    this.loadObjTree(oXMLDoc, oChild, vValue[nItem]);
                    oParentEl.appendChild(oChild);
                }
            } else {
                oChild = oXMLDoc.createElement(sName);
                if (vValue instanceof Object) {
                    this.loadObjTree(oXMLDoc, oChild, vValue);
                } else if (vValue !== null && vValue !== true) {
                    oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));
                }
                oParentEl.appendChild(oChild);
            }
        }
    },
    'fromXML' : function (oXMLParent, nVerbosity /* optional */, bFreeze /* optional */, bNesteAttributes /* optional */) {
        try {
            var nVerbMask = arguments.length > 1 && typeof nVerbosity === "number" ? nVerbosity & 3 : /* put here the default verbosity level: */ 1;
            return this.createObjTree(oXMLParent, nVerbMask, bFreeze || false, arguments.length > 3 ? bNesteAttributes : nVerbMask === 3);
        } catch (e){
            throw new System.exception.XMLException();
        }
    },
    'toXML' : function (oObjTree, sNamespaceURI /* optional */, sQualifiedName /* optional */, oDocumentType /* optional */) {
        try {
            var oNewDoc = document.implementation.createDocument(sNamespaceURI || null, sQualifiedName || "", oDocumentType || null);
            loadObjTree(oNewDoc, oNewDoc, oObjTree);
            return oNewDoc;
        } catch (e){
            throw new System.exception.XMLException();
        }
    }
})

/**
 * Created by yadirhb on 2/19/2016.
 */
Class('runtime.serialization.json.JXONTree', {
    'toString' : function(){
        return "null";
    },
    'valueOf': function(){
        return null;
    },
    'appendJXON' : function (oObjTree) {
        System.runtime.serialization.json.JXONParser.loadObjTree(document, this, oObjTree);
        return this;
    }
})
/**
 * Created by yadirhb on 2/19/2016.
 */
Class('exception.XMLException', {
    '$extends' : System.Exception,
    'constructor': function(message){
        this.$super(message || "Error during the XML transformation process.");
    }
})
if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/19/2016.
     */
    Static.Class('runtime.serialization.xml.XMLParser', {
        'stringToXML': function (sValue) {
            try {
                var xmlDoc;
                if ($global.DOMParser) {
                    xmlDoc = (new DOMParser()).parseFromString(sValue, "text/xml");
                }
                else {
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = "false";
                    xmlDoc.loadXML(sValue);
                }
                return xmlDoc;
            } catch (e) {
                throw new System.exception.XMLException("Unable to parse source string to xml object.");
            }
        }
    })
}
/**
 * Created by yadirhb on 2/18/2016.
 */
Static.Class('security.cryptography.Base64Transform', {
    '_keyStr': "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    'encode': function (e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = this._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
        }
        return t;
    },
    'decode': function (e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r)
            }
            if (a != 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = this._utf8_decode(t);
        return t;
    },
    '_utf8_encode': function (e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t;
    },
    '_utf8_decode': function (e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3
            }
        }
        return t;
    }
})
/**
 * Created by yadirhb on 3/18/2016.
 */
Static.Class('utils.Assert', {
    'assert' : function(){
        if($global.console && $global.console.assert) {
            $global.console.assert(arguments[0], arguments[1], arguments[2]);
        }
    }
})
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
/**
 * This class wraps the global.console object to give support older Browsers.
 */
Static.Class('utils.Log', {
    '$extends' : 'System.utils.Assert',
    'debug': function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.debug ) {
                $global.console.debug(arguments[0]);
            }
        }
    },
    'info': function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.info) {
                $global.console.info(arguments[0]);
            }
        }
    },
    'log' : function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.log) {
                $global.console.log(arguments[0]);
            }
        }
    },
    'error' : function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.error) {
                $global.console.error(arguments[0]);
            }
        }
    },
    'warn' : function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.warn) {
                $global.console.warn(arguments[0]);
            }
        }
    },
    'assert' : function(){
        if(CONFIG.DEBUG === true) {
            this.$superclass.assert.apply(this, arguments);
        }
    },
    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    'makeError' : function(id, msg, err, requireModules) {
        var e = new System.Exception(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.innerException = err;
        }
        return e;
    }
});
if (isBrowser()) {
    /**
     * Created by yadirhb on 2/17/2016.
     * Class with utilities for identifying browser version and support of resources.
     */
    Static.Class('utils.UserAgent', userAgent)
}
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
})(this);