/**
 * Created by yadirhb on 9/24/2016.
 */
if (Environment.isNode()) {
    var path = require('path');
    Static.Class('runtime.NodeLoader', {
        'load': function load(dependency, callback) {
            var requests;
            if (dependency) {
                if (dependency.is(Array)) {
                    requests = [];
                    dependency.each(function (dep) {
                        requests.push(load(dep));
                    });
                } else {
                    var sourcesSet = System.Router.getSourcesSet();//["/src/"];
                    var baseDir = System.Router.getBaseDir();
                    for (var i = 0; i < sourcesSet.length; i++) {
                        try {
                            var dep = dependency;
                            if (validIdientifierRegex.test(dep)) {
                                dep = path.normalize(baseDir + "/" + sourcesSet[i] + dep.replaceAll(".", "/"));
                            }
                            requests = new DependencyRequest(dependency, require(dep));
                            requests.loaded = true;
                            break;
                        } catch (e) {
                            requests = new DependencyRequest(dependency, e);
                        }
                    }
                }

                if (callback && callback.is(Function)) {
                    callback(requests);
                }
            }
            return requests;
        }
    })
}