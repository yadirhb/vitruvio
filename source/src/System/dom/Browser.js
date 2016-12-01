if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/25/2016.
     */
    Static.Class('dom.Browser', {
        'scrollTop': function () {
            var doc = document.documentElement;
            return ($global.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        },
        'scrollLeft': function () {
            var doc = document.documentElement;
            return ($global.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        }
    })
}