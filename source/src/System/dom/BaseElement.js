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