/**
 * Created by yadirhb on 9/24/2016.
 */
if (Environment.isBrowser()) {
    Static.Class('runtime.BrowserLoader', {
        '$extends': 'System.runtime.Loader',
        'load': function load(dependency, callback, async) {
            async = async || (true === async);
            var requests;
            if (dependency) {
                if (dependency.is(Array)) {
                    requests = [];
                    var loaded = [];

                    function onLoad(request) {
                        loaded.push(request);

                        if (loaded.length == dependency.length) {
                            if (callback && callback.is(Function)) {
                                callback(loaded);
                            }
                        }
                    }

                    dependency.each(function (dep) {
                        requests.push(load(dep, onLoad, async));
                    });
                } else {
                    var script = document.createElement("script"), container = document.getElementsByTagName("head")[0];

                    script.setAttribute("type", "text/javascript");
                    script.setAttribute("async", async);

                    System.EventManager.addEventListener(script, 'error', function onError(e) {
                        System.EventManager.removeEventListener(script, 'error', onError);
                        container.removeChild(script);
                        requests = new DependencyRequest(dependency, e);
                        if (callback && callback.is(Function)) {
                            callback(script.querrier);
                        }
                    });

                    if (async) {
                        if (System.utils.UserAgent.isIE()) {  //IE
                            System.EventManager.addEventListener(script, 'readystatechange', function onReadyStateChange() {
                                if (script.readyState == "loaded" ||
                                    script.readyState == "complete") {
                                    System.EventManager.removeEventListener(script, 'readystatechange', onReadyStateChange);

                                    if (callback && callback.is(Function)) {
                                        script.querrier.loaded = true;
                                        callback(script.querrier);
                                    }
                                }
                            });
                        } else {  //Others
                            System.EventManager.addEventListener(script, 'load', function load() {
                                if (callback && callback.is(Function)) {
                                    script.querrier.loaded = true;
                                    callback(script.querrier);
                                }
                            });
                        }
                    }

                    var sourcesSet = System.Router.getSourcesSet();//["/src/"];
                    var baseDir = System.Router.getBaseDir();
                    for (var i = 0; i < sourcesSet.length; i++) {
                        try {
                            var dep = dependency;
                            if (validIdientifierRegex.test(dep)) {
                                dep = baseDir + sourcesSet[i] + dep.replaceAll(".", "/") + '.js';
                            }
                            script.setAttribute("src", dep);
                            requests = new DependencyRequest(dependency, container.appendChild(script));
                            script.querrier = requests;
                            break;
                        } catch (e) {
                            requests = new DependencyRequest(dependency, e);
                        }
                    }
                }
            }
            return requests;
        }
    })
}