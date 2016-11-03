/**
 * A resource loader is an object that is responsible for loading resources. The class Loader is an abstract class. Given the name of a resource, a resource loader should attempt to locate or generate data that constitutes a definition for the resource. A typical strategy is to transform the name into a file name and then read a "resource file" of that name from a file system.
 */
Class('runtime.Loader', {
    'constructor': function (config) {
        apply(this, config);
    },
    'defineClass': function (name, body) {
    },
    'defineNamespace': function (name) {
    },
    /**
     * Finds the resource with the given name.
     * @param name The name of the resource
     */
    'find': function (name) {
        return map[name];
    },
    /**
     *
     * @param deps
     * @param callback
     * @param async
     * @returns {*}
     */
    'load': function load(deps, callback, async) {
        async = async || (true === async);
        try {
            if (Environment.isBrowser()) {
                return System.runtime.BrowserLoader.load.call(this, deps, callback, async);
            } else if (Environment.isNode()) {
                return System.runtime.NodeLoader.load.call(this, deps, callback, async);
            }
        } catch (e) {
            return new DependencyRequest(deps, e);
        }
    },
    'cancelLoad': function (dependency, callback, force) {
    }
})