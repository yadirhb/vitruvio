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