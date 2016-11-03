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