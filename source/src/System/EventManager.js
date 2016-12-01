/**
 * Manage events between components.
 * This class wraps and handles compatibility between browsers and event management.
 */
Static.Class('EventManager', {
    /**
     * Adds a listener to the specified target.
     * @param target {Object} The target which will be observed.
     * @param eventName {String} The event name.
     * @param listener {Function} The listener instance.
     * @param useCapture {Boolean} True to use capture or False otherwise.
     * @returns Target object for chaining.
     */
    'addEventListener': function (target, eventName, listener, useCapture) {
        var ver = System.utils.UserAgent.IE.getVersion();
        if (is(target, System.EventEmitter)) {
            target.on(eventName, listener, useCapture);
        } else if ((ver != -1 && ver <= 8) || is(target, Element)) {
            if (ver != -1 && ver < 11) {
                target.attachEvent("on" + eventName, listener, useCapture);
            } else target.addEventListener(eventName, listener, useCapture);
        }
        return target;
    },
    /**
     * Removes a listener from the specified target instance.
     * @param target {Object} The target which contains the listener.
     * @param eventName {String} The event name.
     * @param listener {Function} The listener instance.
     * @returns Target object for chaining.
     */
    'removeEventListener': function (target, eventName, listener) {
        var ver = System.utils.UserAgent.IE.getVersion();
        if (is(target, System.EventEmitter)) {
            target.off(eventName, listener);
        } else if ((ver != -1 && ver <= 8) || is(target, Element)) {
            if (ver != -1 && ver < 11) {
                target.detachEvent("on" + eventName, listener);
            } else target.removeEventListener(eventName, listener);
        }

        return target;
    }
})