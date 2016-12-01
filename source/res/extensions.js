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
                var args = Array.prototype.concat([null], arguments[1] || this.constructor.arguments);
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