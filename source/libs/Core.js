var validIdientifierRegex = /^@?[a-z_A-Z]\w+(?:\.@?[a-z_A-Z]\w+)*$/;

/**
 * Parent class for inheritance into the System.
 * @returns {Type}
 * @constructor
 */
function Type(/*[Origin]*/) {
    if (this.is(Type)) {
        var $type = arguments[0];
        /**
         * Gets the Type instance type.
         * @returns {Object}
         */
        this.getType = function () {
            return $type;
        }

        return this;
    }
}

/**
 *
 * @param prev
 * @param current
 * @returns {DynamicContainer}
 * @constructor
 */
function DynamicContainer(prev, current) {
    if (this.is(DynamicContainer)) {
        var context = this;

        /**
         *
         * @param curr
         * @returns {DynamicContainer}
         */
        this.updateCurrent = function (curr) {
            prev = current;
            current = curr;
            return context;
        }

        /**
         *
         * @returns {*}
         */
        this.getCurrent = function () {
            return current;
        }

        /**
         *
         * @returns {*}
         */
        this.getPrev = function () {
            return prev;
        }

        return this;
    }
}

/**
 * @param name
 * @param container
 * @returns {Member}
 * @constructor
 */
function Member(/*[Type]*/) {
    if (this.is(Member)) {
        var context = this, name = arguments[0], container = arguments[1], $type = arguments[2];
        Type.call(this, $type || Member);

        /**
         * Gets the Member instance name;
         * @returns {String}
         */
        this.getName = function () {
            return name;
        }

        /**
         * Gets the Member instance context. This method is suitable to be overwrote in inherited members.
         */
        this.getContext = function () {
            return context;
        }

        /**
         * @protected
         * @returns {Object/Function}
         */
        this.getParent = function () {
            var cont = container;
            if (cont && !cont.is(Member)) {
                cont = new OutsiderContainer(cont);
            }
            return cont;
        }

        /**
         * Gets the Member instance container.
         * @returns {Object/Function}
         */
        this.getContainer = function () {
            var cont = this.getParent();
            if (cont) {
                if (cont.is(DynamicContainer)) {
                    cont = cont.getCurrent();
                } else if (cont.is(OutsiderContainer)) {
                    cont = cont.getContext();
                }
            }
            return cont;
        }

        /**
         * Gets the Member instance's full path_module String.
         * @returns {String}
         */
        this.getFullPath = function () { // global.A.B.C; A.B.C
            var path = "";
            var cont = this.getContainer();

            while (cont && cont.is(Member) && !cont.is(OutsiderContainer)) {
                path = cont.getName() + "." + path;
                cont = cont.getContainer();
            }

            return path + this.getName();
        }

        return this;
    }
}

define(Member, Type, {
    'getMember': function (member) {
        // if(typeof member !== 'string' &&
        // !Core.RegExp.Identifier.test(member))
        // throw new Error("[InvalidArgumentException]");
        return this.getContext()[member];
    },
    'hasMember': function (member) {
        return this.getMember(member) != undefined;
    },
    'addMember': function (member) {
        if (member.is(Member)) {
            // Get the current container instance
            return this.getContext()[member.getName()] = Member.updateParent(member, this);
        }
        throw new System.exception.InvalidTypeException("The supplied object must be a  instance");
    },
    'removeMember': function (member) {
        if (member.is(Member)) {
            var m = this.getContext()[member.getName()];
            if (m) {
                try {
                    delete this.getContext()[member.getName()];
                } catch (error) {
                    this.getContext()[member.getName()] = undefined;
                }
                return Member.updateParent(m);
            }
        }
        throw new System.exception.InvalidArgumentsException("The supplied object must be a Member instance");
    }
}, {
    'BuilderTemp': function BuilderTemp() {
        if (this.is(BuilderTemp)) {
            this.onBuild = new Function;
        }
    },
    'updateParent': function (member, current) {
        if (member.is(Member)) {
            var container = member.getContainer(),
                parent = typeof (container) == "undefined" || !container.is(DynamicContainer) ? new DynamicContainer(container, current) : container.updateCurrent(current);
            member.getParent = function () {
                return parent;
            }
            return member;
        }
        throw new System.exception.InvalidArgumentsException("The supplied object must be a Member instance");
    },
    'register': function (member) {
        if (member.is(Member)) {
            return Loader.register(member.getFullPath(), member);
        }
        throw new System.exception.InvalidArgumentsException("The supplied object must be a Member instance");
    }
});

function OutsiderContainer(/*[Member]*/) {
    if (this.is(OutsiderContainer)) {
        var self = arguments[0];
        Member.call(this, "");

        this.getContext = function () {
            return self;
        }
    }
}
define(OutsiderContainer, Member);

/**
 * The Namespace method can be used either to get a Namespace instance or to define a namespace object and attach inner members in it.
 * @param config String/Object
 * config object contains:
 * {
 * 		'$name': String,
 * 		'$container' : Object/Function // Specifies the container of the newly created Namespace instance, cannot be null, or undefined. Global is used by default.
 * }
 * @param member... If the Namespace is being instantiated, this argument could be the wrapper object which will contain the namespace instance.
 * Otherwise Member sequence, comma separated, which will represent the nested members of the current namespace.
 * @constructor
 */
function Namespace(/*[Member]*/) {
    if (arguments.length > 0) {
        var config = {}, cfx = arguments[0];
        if (cfx != null && cfx != undefined) { // Check if not null or undefined
            // Extract the configurations for create the namespace if ir doesn't exist.
            if (isString(cfx)) {
                config['$name'] = cfx;
            } else if (isObject(cfx)) {
                config = cfx;
            } else throw new System.exception.InvalidTypeException("The first argument must be either a [String/Object], but " + getClassName(cfx) + " was supplied instead");

            if (!(validIdientifierRegex.test(config.$name)))
                throw new Exception("Invalid namespace identifier: '" + config.$name + "'", 'InvalidIdentifierException');

            var container = config.$container || (CONFIG.GLOBAL || $global);

            if (this.is(Namespace)) { // Check if is instantiation
                if (arguments.length <= 2) {
                    container = arguments[1] || container;

                    var wrapper = Namespace.getLastNode(container, config.$name),
                        name = config.$name.replace(wrapper.name, "");
                    name = name[0] == "." ? name.substring(1, name.length) : name; // com.example

                    container = wrapper.container;

                    if (name != "") {
                        var nsparts = name.split(".");


                        // loop through the parts and create a nested namespace if necessary
                        do {
                            name = nsparts.shift();
                            // check if the current parent already has the namespace declared
                            // if it isn't, then create it
                            if (nsparts.length == 0) break;

                            container = container[name] = new Namespace(name, container);
                        } while (nsparts.length > 0)


                        // Call the super for initialization
                        Member.call(this, name, container, Namespace);

                        /**
                         * @override
                         * @param member
                         */
                        this.addMember = function (member) {
                            return Member.register(Member.prototype.addMember.call(this, member));
                        }

                        return container[name] = this;
                    }

                    return container;
                }
                throw new System.exception.InvalidArgumentsException("Invalid arguments number, expected no more than 2.")
            } else {
                var ns;
                if (!Namespace.contains(container, config.$name)) {
                    ns = new Namespace(config.$name, container);
                } else {
                    var node = Namespace.getLastNode(container, config.$name);
                    if (node && ("container" in node)) ns = node["container"];
                }

                if (ns) {
                    function updateContainer(member, ns) {
                        if (member && member.is(Member)) {
                            Loader.unregister(member.getFullPath());
                            var cont = member.getContainer();
                            if (cont && cont.is(Member)) cont.removeMember(member);

                            ns.addMember(member);
                        }
                    }

                    Array.prototype.slice.call(arguments, 1, arguments.length).each(function (arg) {
                        if (arg && arg.is(Member.BuilderTemp)) {
                            arg.onBuild = function (member) {
                                updateContainer(member, ns);
                            }
                        }
                        else updateContainer(arg, ns);
                    });
                }
                return ns;
            }
        }
    }
    throw new System.exception.InvalidArgumentsException("The first argument must be specified");
}

define(Namespace, Member, undefined, {
    'contains': function (container, ns) {
        return Namespace.getLastNode(container, ns)['name'] == ns;
    },
    'getLastNode': function (container, ns) {
        if (!(ns && typeof ns === 'string')
            || !(container && typeof container === 'object' || typeof container === 'function'))
            throw new System.exception.InvalidArgumentsException("Expected types (String, [Object | Function]) to search into namespace.");

        if (!(validIdientifierRegex.test(ns))) {
            throw new Exception("Invalid  namespace: '" + ns + "'", 'InvalidClassNameException');
        }

        var nsparts = ns.split("."), result = {'name': "", 'container': container}, first = true;

        // loop through the parts and create a nested namespace if necessary
        while (nsparts.length > 0) {
            var node = nsparts.shift();
            // check if the current parent already has the namespace declared
            // if it isn't, then create it

            if (node in container && container[node]) {
                result['container'] = container = container[node];
                result['name'] += first ? node : "." + node;
            } else break;
            first = false;
        }

        return result;
    }
});

function Loader() {
}

var map = {};

function DependencyRequest(name, module) {
    if (this.is(DependencyRequest)) {
        this.module = module;
        this.name = name;

        this.loaded = false;

        this.isSuccess = function () {
            return module && !module.is(Error);
        }
    }
}

define(Loader, Function, undefined, {
    'isAutoLoadDisabled': true,
    'loaders': {
        "values": { // Platform
            "values": [] // Client
        }
    },
    'using': function (dependency, callback) {
        if (dependency) {
            dependency = dependency.is(String) ? [dependency] : dependency;

            var requests = [], unresolved = [], caller = arguments.callee.caller, async = false;

            dependency.each(function (dep) {
                if (dep in map) {
                    if (requests.indexOf(map[dep]) == -1) {
                        requests.push(map[dep]);
                    }
                } else if (unresolved.indexOf(dep) == -1) {
                    unresolved.push(dep);
                }
            });

            if (unresolved.length > 0) {
                if (callback && isFunction(callback)) {
                    async = true;
                    Loader.observe(dependency, function onObserve() {
                        if (isString(dependency)) {
                            if (requests.indexOf(map[dependency]) == -1) requests.push(map[dependency])
                        } else if (isArray(dependency)) {
                            dependency.each(function (dep) {
                                if (requests.indexOf(map[dep]) == -1) requests.push(map[dep]);
                            })
                        }
                        try {
                            return callback.apply(caller, requests);
                        } catch (e) {
                        }
                    });
                }

                function identify(mods) {
                    if (mods) {
                        if (mods.is(Array)) {
                            mods.each(function (module) {
                                identify(module);
                            });
                        } else {
                            if (mods.isSuccess()) {
                                var name = mods.name, classpath = name;//.replaceAll("/", ".");
                                var module = mods.module;

                                // var index = unresolved.indexOf(name);
                                if (classpath in map) {
                                    // unresolved.remove(index);
                                    if (requests.indexOf(map[classpath]) == -1) requests.push(map[classpath]);
                                } else if (module && module.is(DependencyRequest) && module.loaded) {
                                    Loader.notify(name);
                                }
                            }
                        }
                    }
                    return;
                }

                function onload(modules) {
                    return identify(modules);
                }

                var modules = Loader.load(unresolved, onload, async);

                identify(modules);
            }

            return dependency.length == 1 && requests.length == 1 ? requests[0] : undefined;
        }
    },
    'load': function load(deps, callback, async) {
        if (!Loader.isAutoLoadDisabled) {
            var info = Environment.getInfo(), loader;

            loader = Loader.getLoader(info) || Loader.getSystemLoader();
            return loader ? loader.load(deps, callback, async) : undefined;
        }
    },
    'observers': {
        'add': function add(index, observer) {
            if (!(index in this)) this[index] = [];
            if (this[index].indexOf(observer) == -1) this[index].push(observer);

            return observer;
        },
        'remove': function (index) {
            var dep = this[index];
            if (dep) {
                try {
                    delete this[index];
                } catch (e) {
                    this[index] = undefined;
                }
                return dep;
            }
        }
    },
    /**
     *
     * @param dependency
     * @param callback
     * @returns {DependencyObserver}
     * @constructor
     */
    'DependencyObserver': function DependencyObserver(dependency, callback) {
        if (dependency && isFunction(callback)) {
            if (this.is(DependencyObserver)) {
                var context = this, deps = [], loadedDeps = [];
                /**
                 *
                 */
                this.onLoaded = function (loaded, object) {
                    var i = deps.indexOf(loaded);
                    if (i != -1) {
                        deps.remove(i);
                        loadedDeps[i + 1] = object;
                    }

                    if (deps.length == 0) {
                        callback.apply(callback, loadedDeps);
                    }
                }

                if (isString(dependency)) {
                    if (!map[dependency]) {
                        deps.push(dependency);
                        return Loader.observers.add(dependency, this);
                    }
                } else if (isArray(dependency)) {
                    each(dependency, function (dep) {
                        if (!map[dep]) {
                            deps.push(dep);
                            Loader.observers.add(dep, context);
                        }
                    });

                    return this;
                }
            }
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String/String[], Function)");
    },
    /**
     *
     * @param dependency
     * @param callback
     */
    'observe': function (dependency, callback) {
        if (dependency && callback && isFunction(callback)) {
            return new Loader.DependencyObserver(dependency, callback);
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String/String[], Function)");
    },
    'notify': function (dependency) {
        if (dependency && isString(dependency)) {
            var observers = Loader.observers.remove(dependency);
            each(observers, function (observer) {
                if (observer.is(Loader.DependencyObserver)) {
                    observer.onLoaded(dependency, map[dependency]);
                }
            });
            return;
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String)");
    },
    'register': function (classPath, object) {
        if (classPath && isString(classPath) && object && (isObject(object) || isFunction(object))) {
            var target = map[classPath] = object;
            Loader.notify(classPath);
            return target;
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String, Object/Function)");
    },
    'unregister': function (classPath) {
        if (classPath && isString(classPath)) {
            var target = map[classPath];
            try {
                delete map[classPath];
            } catch (e) {
                map[classPath] = undefined;
            }
            return target;
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, expected (String, Object/Function)");
    },
    'disableAutoLoad': function (disable) {
        Loader.isAutoLoadDisabled = disable === true;
    },
    'getLoader': function (descriptor) {
        if (descriptor && isObject(descriptor)) {
            var loader = Loader.loaders[descriptor.environment];
            if (loader) {
                loader = (loader[descriptor.client] || loader['values']);
            } else {
                loader = Loader.loaders.values;
            }
            return loader[descriptor.index || 0];
        }

    },
    'getSystemLoader': function () {
        if (!Loader.$sysloader) {
            Loader.$sysloader = new System.runtime.Loader();
        }
        return Loader.$sysloader;
    },
    'setLoader': function (loader) {
        if (loader && loader.is(System.runtime.Loader)) {
            var env = loader.environment ? loader.environment.is(Array) ? loader.environment : [loader.environment] : ['values'],
                client = loader.client ? loader.client.is(Array) ? loader.client : [loader.client] : ['values'];

            env.each(function (environment) {
                if (!Loader['loaders'][environment]) {
                    Loader['loaders'][environment] = {"values": []};
                }

                client.each(function (cl) {
                    if (!Loader['loaders'][environment][cl]) {
                        Loader['loaders'][environment][cl] = [];
                    }

                    Loader['loaders'][environment][cl].push(loader);
                })
            });
            return;
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments supplied, loader object expected to be instanceof '" + $root + ".runtime.Loader' class.");
    }
});

var clsMembers = {
    'getAllMethods': function () {
        var methods = [];
        var $super = this;

        while ($super = $super.$superclass) {
            $super.getAllMethods().each(function (method) {
                methods.push(method);
            });
        }

        this.getDeclaredMethods().each(function (method) {
            methods.push(method);
        });
        return methods;
    },
    'getDeclaredMethods': function () {
        var methods = [], def = this['prototype']['$def'];
        if (def) {
            for (var m in def) {
                if (hasProp(def, m) && typeof def[m] == 'function') {
                    methods.push(new System.reflection.Method(m, def[m]));
                }
            }
        }
        return methods;
    },
    'is': function (type) {
        return is(this.getContext(), type);
    }
}

/**
 * @param className String the class name
 * @param definition Object
 * @constructor
 */
function Class(/*[Member]*/) {
    var classpath = arguments[0], definition = arguments[1], def = apply({}, definition);
    if (is(this, Class)) {
        if (arguments.callee.caller == Class) { //Instantiation of classes objects
            var context = this, $super, constructor, $ifaces = [], CustomType;
            eval("CustomType = function " + classpath + "(/*[Class]*/){ return this; }");

            if ('constructor' in def && hasProp(def, 'constructor')) {
                constructor = def.constructor;
                delete def.constructor;
            }

            if ('$extends' in def) {
                switch (typeof def['$extends']) {
                    case 'string':
                        def['$extends'] = Loader.using(def['$extends']);
                        if (!def['$extends'] || !isFunction(def['$extends'])) {
                            //if () throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(def['$extends'])['constructor']['name']);
                            throw new Exception('The super class definition was unresolved', "UnresolvedSuperClassException");
                        }
                    case 'function':
                        $super = def['$extends'];
                        delete def['$extends'];
                        break;
                    default:
                        throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(def['$extends'])['constructor']['name']);
                }

                if (constructor == undefined) constructor = $super;
            }

            if (constructor == undefined) constructor = CustomType;

            var $class = (function ($super) {
                var func;

                function construct() {
                    if ($super) {
                        this.$super = $super;
                    }
                    constructor.apply(this, arguments);
                    if (isFunction($super)) {
                        this.$super = this.as($super);
                    }
                    return this;
                }

                eval("func = function " + classpath + "(/*[Class]*/){ construct.apply(this, arguments); }");
                return func;
            })($super);

            var cleanDef = removeKeyWords(def);

            if ($super) {
                define($class, new (define(CustomType, $super.prototype))(), undefined, {
                    '$superclass': $super
                });
            }

            if ('$implements' in def) {
                function collectIfaces(iface) {
                    if (isString(iface)) {
                        var name = iface;
                        iface = Loader.using(iface);
                        if (!iface) throw new Exception('Interface definition unresolved', "UnresolvedInterfaceException");
                    }

                    if (isFunction(iface)) {
                        $ifaces.push(new iface);
                    } else throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(iface)['constructor']['name']);
                }

                if (isArray(def['$implements'])) {
                    each(def['$implements'], function (iface) {
                        collectIfaces(iface);
                    })
                } else collectIfaces(def['$implements']);

                delete def['$implements'];
            }

            Member.call(this, classpath, undefined, Class);

            this.getInterfaces = function () {
                return $ifaces;
            }

            $class = apply($class, this, clsMembers);

            apply($class.prototype, mixin(cleanDef, {
                'getClass': function () {
                    return $class;
                },
                '$def': cleanDef,
                '$proto': $class.prototype,
                'is': function (type) {
                    var _isIt = false;
                    if (isFunction(type)) {
                        if (is(this, type)) return true;
                        else if ($ifaces.length > 0) {
                            $ifaces.each(function (iface) {
                                if (iface.is(type)) return _isIt = true;
                            });
                        }
                    }
                    return _isIt;
                }
            }));

            if ($ifaces.length > 0) {
                System.Interface.ensureImplements.apply($class, [$class].concat($ifaces));
            }

            return $class;
        }
    } else {
        if (arguments.length == 2) {
            if (classpath && isString(classpath) && definition && isObject(definition)) {
                var ns = new Namespace(classpath, def['$container']),
                    name = ns.getName(), container = ns.getParent(), $static = def.$static;

                delete def['$static'];

                delete def['$container'];

                try {
                    var $class = apply(new Class(name, def), $static);
                    return Member.register(container.addMember($class));
                } catch (e) {
                    var unresolved = [];
                    switch (e.name) {
                        case "UnresolvedSuperClassException":
                        case "UnresolvedInterfaceException":
                            if ("$extends" in definition) {
                                unresolved.push(definition['$extends']);
                            }
                            if ("$implements" in definition) {
                                if (isString(definition['$implements'])) {
                                    unresolved.push(definition['$implements']);
                                } else if (isArray(definition['$implements'])) {
                                    unresolved = unresolved.concat(definition['$implements']);
                                }
                            }
                            var builderTemp = new Member.BuilderTemp(name, e);
                            Loader.observe(unresolved, function (error) {
                                if (!error) {
                                    var cls = Class(classpath, definition);
                                    return builderTemp.onBuild(cls);
                                }
                            });
                            return builderTemp;
                        default:
                            throw e;
                    }
                }
            }
            throw new System.exception.InvalidArgumentsException("Invalid arguments provided, expected (String, Object).");
        }
        throw new System.exception.InvalidArgumentsException("Invalid arguments number, expected exactly 2.")
    }
    throw new System.exception.IllegalCallException("Cannot explicitly create Class instances.");
}

define(Class, Member);

function removeKeyWords(obj) {
    if (obj) {
        var res = {};
        for (var p in obj) {
            if (hasProp(obj, p) && !p.contains("$")) res[p] = obj[p];
        }
        return res;
    }
}

/**
 * Static classes reference
 */
var Static = {
    'Class': function () {
        var args = arguments[1], def = {};

        if (args && isObject(args) && hasProp(args, 'constructor')) {
            def.constructor = args.constructor;
            try {
                delete args.constructor;
            } catch (e) {
                args.constructor = undefined;
            }
        }

        return Class(arguments[0], apply(def, {'$static': removeKeyWords(args)}));
    }
};

/** Core publishing section */
System = new Namespace($root, {});
System.$global = $global;
/**
 * Functions
 **/
System.isArray = isArray;
System.isFunction = isFunction;
System.isObject = isObject;
System.isBoolean = isBoolean;
System.isNumber = isNumber;
System.isString = isString;
System.isInteger = isInteger;
System.isFloat = isFloat;
System.isNull = isNull;
System.getClassName = getClassName;
System.using = Loader.using;
System.hasProp = hasProp;
System.getOwn = getOwn;
System.freeze = freeze;
System.alias = alias;
System.bind = bind;
System.apply = apply;
System.mixin = mixin;

System.setGlobal = function (/*Namespace*/) {
    return CONFIG.GLOBAL = arguments[0] || CONFIG.GLOBAL;
}

System.enableDebug = function (/*Boolean*/) {
    CONFIG.DEBUG = true === arguments[0];
}

/**
 * Enables or disables the external resource load.
 * @param enable True for automate loading, False otherwise.
 */
System.disableAutoLoad = function (enable) {
    Loader.disableAutoLoad.apply(this, arguments);
}

System.isAutoLoadDisabled = function () {
    return Loader.isAutoLoadDisabled;
}

System.setLoader = function (loader) {
    return Loader.setLoader.apply(this, arguments);
}

System.config = function configure(config) {
    var cfg = arguments[0], message = "The supplied configuration is not what expected.";
    if (cfg) {
        if (cfg.is(Function)) {
            try {
                cfg = cfg() || {};
            } catch (e) {
                message = e.message;
            }
        }

        if (isObject(cfg)) {
            System.disableAutoLoad(cfg.disableAutoLoad || System.isAutoLoadDisabled());
            System.enableDebug(cfg.enableDebug || CONFIG.DEBUG);
            System.setGlobal(cfg.global || CONFIG.GLOBAL);

            if (cfg.loader) {
                if (cfg.loader.is(Array)) {
                    cfg.loader.each(function (loader) {
                        System.setLoader(loader);
                    });
                } else {
                    System.setLoader(cfg.loader);
                }
            }

            if (cfg.sourcesSet) {
                if (cfg.sourcesSet.is(Array)) {
                    System.Router.sourcesSet = cfg.sourcesSet;
                } else if (cfg.is(String)) {
                    System.Router.sourcesSet.push(cfg.sourcesSet);
                }
            }
            return;
        } else if (cfg.is(Array)) {
            cfg.each(function (configuration) {
                configure(configuration);
            });
            return;
        }
    }

    throw new Exception(message, 'InvalidConfigurationException');
}

System.getMap = function () {
    return map;
}

Loader.register($root + '.Static', Static);
Loader.register($root + '.reflection.Type', Type);
Loader.register($root + '.reflection.Member', Member);

/**
 * Defines a new class and registers it into the context object.
 *
 * @param className
 *            {String} The name of the member to be defined. It must be a valid
 *            namespace identifier.
 * @param definition
 *            {Object} Contains the public class members.
 */
Loader.register($root + '.Class', Class);

// System.Namespace = Namespace;
Loader.register($root + '.Namespace', Namespace);

System.setGlobal(System);

/**
 * XT roots a temporal System namespace for extensions.
 * */
var xt = new Namespace($root, {});