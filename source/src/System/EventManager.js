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