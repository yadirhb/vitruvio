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