/**
 * Created by yadirhb on 9/24/2016.
 */
if (Environment.isNode()) {
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
                    if (dependency.is(String)) {
                        var path = require('path');
                        var sourcesSet = System.Router.getSourcesSet();
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
                    } else if (dependency.is(Object)) {
                        try {
                            requests = new DependencyRequest(dependency.member, require(dependency.pkg));
                            requests.combined = true;
                            requests.loaded = true;
                        } catch (e) {
                            throw new System.exception.RuntimeException(e.message);
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