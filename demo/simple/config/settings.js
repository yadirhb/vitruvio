/**
 * Created by yadirhb on 9/25/2016.
 */
var loaded = 0;
System.config({
    'corePath': "",
    'disableAutoLoad': false,
    'enableDebug': false,
    'loader': new System.runtime.Loader({
        'environment': 'browser',
        'client': ['chrome', 'firefox'],
        'load': function () {
            console.log("%s resources load requests made on Chrome|Firefox.", ++loaded);
            return this.$proto.load.apply(this, arguments);
        }
    })
});