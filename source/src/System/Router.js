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