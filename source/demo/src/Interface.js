/**
 * Constructor that creates a new Interface object for checking a function implements the required methods.
 * @param name | String | the instance name of the Interface
 * @param body | Array | methods that should be implemented by the relevant function
 */
function Interface(/*[Member]*/) {
    var classpath = arguments[0], definition = arguments[1], def = apply({}, definition), $iface;
    if (this.is(Interface)) {
        if (arguments.callee.caller == Interface) { //Instantiation of classes objects)
            var context = this, CustomType = eval("CustomType = function " + classpath + "(/*[Interface]*/){ return context; }"), base, actions = '$actions' in definition ? definition['$actions'] : definition || [];

            if ('$extends' in def) {
                switch (typeof def['$extends']) {
                    case 'string':
                        def['$extends'] = Loader.using(def['$extends']);
                        if (!def['$extends'] || !isFunction(def['$extends'])) {
                            //if () throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(def['$extends'])['constructor']['name']);
                            throw new Exception('The super class definition was unresolved', "UnresolvedSuperClassException");
                        }
                    case 'function':
                        base = def['$extends'];
                        delete def['$extends'];
                        break;
                    default:
                        throw new Exception("Invalid super type, cannot be an instance of: " + Object.getPrototypeOf(def['$extends'])['constructor']['name'], "InvalidSuperClassException");
                }
            }
            if (isObject(actions) && !isArray(actions)) {
                var aux = [];
                for (var i in actions) {
                    if (hasProp(actions, i) && isFunction(actions[i])) {
                        aux.push(i);
                    }
                }
                actions = aux;
            }

            $iface = (function () {
                var func;
                eval("func = function " + classpath + "(/*[Interface]*/){}");
                return func;
            })();

            if (base) {
                define($iface, new (define(CustomType, base.prototype))(), undefined, {
                    '$superclass': base
                });
            } else {
                define($iface, context);
            }

            if (System.isObject(actions)) {
                $iface.$actions = [];

                // Loop through provided arguments and add them to the 'methods' array
                for (var i = 0, len = actions.length; i < len; i++) {
                    // Check the method name provided is written as a String
                    if (!isString(actions[i])) {
                        throw new System.exception.InvalidArgumentException("Interface constructor expects method names to be passed in as a string.");
                    }

                    // If values is as required then add the provided method name to the method array
                    $iface.$actions.push(actions[i]);
                }

                delete definition['$actions'];
            }

            Member.call(this, classpath, undefined, Interface);

            this.getAllMethods = function () {
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
            }

            this.getDeclaredMethods = function () {
                var methods = [];
                for (var m in def)
                    if (hasProp(def, m) && typeof def[m] == 'function') {
                        var method = def[m];
                        apply(method, {'name': m});
                        methods.push(method);
                    }
                return methods;
            }

            this.is = function (subject) {
                var _isIt = false;
                if (isFunction(subject)) {
                    if (is(context, subject)) return true;
                    else if (subject.prototype.is(System.Interface)) {
                        context.getInterfaces().each(function (iface) {
                            if (iface.is(subject)) return _isIt = true;
                        });
                    }
                }
                return _isIt;
            }

            $iface = apply($iface, this);

            apply($iface.prototype, def, {
                'getClass': function () {
                    return $iface;
                }
            });

            return $iface;
        }
    } else {
        if (classpath && classpath.is(String)) {
            if (arguments.length > 2) {
                throw new Exception("Invalid arguments number, expected 1 or 2", "InvalidArgumentsException");
            }

            var ns = new Namespace(classpath, def['$container']),
                name = ns.getName(), container = ns.getParent();

            delete def['$container'];

            try {
                $iface = new Interface(name, def);
                return Member.register(container.addMember($iface));
            } catch (e) {
                var unresolved = [];
                switch (e.name) {
                    case "UnresolvedSuperClassException":
                        if ("$extends" in definition) {
                            unresolved.push(definition['$extends']);
                        }

                        var builderTemp = new Member.BuilderTemp(name, e);
                        Loader.observe(unresolved, function (error) {
                            if (!error) {
                                var cls = Interface(classpath, definition);
                                return builderTemp.onBuild(cls);
                            }
                        });
                        return builderTemp;
                    default:
                        throw e;
                }
            }
        }
        throw new Exception("Invalid arguments provided, expected (String[, Object]).", "InvalidArgumentsException");
    }
    throw new Exception("Cannot explicitly create Interface instances.", "IllegalCallException");
}

System.Interface = define(Interface, Member, undefined, {
    'ensureImplements': function ($class) {
        // Check that the right amount of arguments are provided
        if (arguments.length < 2) {
            throw new Exception("Interface.ensureImplements was called with " + arguments.length + "arguments, but expected at least 2.", "InvalidArgumentsException");
        }

        // Loop through provided arguments (notice the loop starts at the second argument)
        // We start with the second argument on purpose so we miss the data object (whose methods we are checking exist)
        for (var i = 1, len = arguments.length; i < len; i++) {
            // Check the object provided as an argument is an instance of the 'Interface' class
            var $iface = arguments[i];
            if (!$iface.is(Interface)) {
                throw new Exception("ensureImplements expects the second argument to be an instance of the 'Interface' constructor.", "InvalidArgumentsException");
            }

            // Otherwise if the provided argument IS an instance of the Interface class then
            // loop through provided arguments (object) and check they implement the required methods
            var methods = $iface.getClass().getAllMethods();
            for (var j = 0, methodsLen = methods.length; j < methodsLen; j++) {

                var method = methods[j];

                // Check method name exists and that it is a function (e.g. test[getTheDate])

                // if false is returned from either check then throw an error
                if (!$class.prototype[method.name] || !isFunction($class.prototype[method.name])) {
                    throw new Exception("'" + $class.getFullPath() + "' does not implement interface member '" + $iface.getFullPath() + "." + method.name + "(" + getSignature(method) + ")'.", "NotImplementedException");
                }
            }
        }
    }
});

Loader.register($root + '.Interface', Interface);

// Class("Interface", {
//     '$extends': 'System.Member',
//     '$static': {
//         'ensureImplements': function ($class) {
//             // Check that the right amount of arguments are provided
//             if (arguments.length < 2) {
//                 throw new Error("Interface.ensureImplements was called with " + arguments.length + "arguments, but expected at least 2.");
//             }
//
//             // Loop through provided arguments (notice the loop starts at the second argument)
//             // We start with the second argument on purpose so we miss the data object (whose methods we are checking exist)
//             for (var i = 1, len = arguments.length; i < len; i++) {
//                 // Check the object provided as an argument is an instance of the 'Interface' class
//                 var $iface = arguments[i];
//                 if (!$iface.is(Interface)) {
//                     throw new System.exception.InvalidArgumentException("ensureImplements expects the second argument to be an instance of the 'Interface' constructor.");
//                 }
//
//                 // Otherwise if the provided argument IS an instance of the Interface class then
//                 // loop through provided arguments (object) and check they implement the required methods
//                 var methods = $iface.getClass().getAllMethods();
//                 for (var j = 0, methodsLen = methods.length; j < methodsLen; j++) {
//
//                     var method = methods[j];
//
//                     // Check method name exists and that it is a function (e.g. test[getTheDate])
//
//                     // if false is returned from either check then throw an error
//                     if (!$class.prototype[method.name] || !isFunction($class.prototype[method.name])) {
//                         throw new Error("Class '" + $class.getFullPath() + "' does not implements the '" + $iface.constructor.getName() + "' interface correctly. The method '" + method.name + "' was not found.");
//                     }
//                 }
//             }
//         }
//     },
//     'constructor': function Interface(/*[Member]*/) {
//         var classpath = arguments[0], definition = arguments[1], def = apply({}, definition), $iface;
//         if (this.is(Interface)) {
//             if (arguments.callee.caller == Interface) { //Instantiation of classes objects)
//                 var context = this, CustomType = eval("CustomType = function " + classpath + "(/*[Interface]*/){ return context; }"), base, actions = '$actions' in definition ? definition['$actions'] : definition || [];
//
//                 if ('$extends' in def) {
//                     switch (typeof def['$extends']) {
//                         case 'string':
//                             def['$extends'] = Loader.using(def['$extends']);
//                             if (!def['$extends'] || !isFunction(def['$extends'])) {
//                                 //if () throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(def['$extends'])['constructor']['name']);
//                                 throw new Exception('The super class definition was unresolved', "UnresolvedSuperClassException");
//                             }
//                         case 'function':
//                             base = def['$extends'];
//                             delete def['$extends'];
//                             break;
//                         default:
//                             throw new Exception("Invalid super type, cannot be an instance of: " + Object.getPrototypeOf(def['$extends'])['constructor']['name'], "InvalidSuperClassException");
//                     }
//                 }
//                 if (isObject(actions) && !isArray(actions)) {
//                     var aux = [];
//                     for (var i in actions) {
//                         if (hasProp(actions, i) && isFunction(actions[i])) {
//                             aux.push(i);
//                         }
//                     }
//                     actions = aux;
//                 }
//
//                 var $iface = (function () {
//                     var func;
//                     eval("func = function " + classpath + "(/*[Interface]*/){}");
//                     return func;
//                 })();
//
//                 if (base) {
//                     define($iface, new (define(CustomType, base.prototype))(), undefined, {
//                         '$superclass': base
//                     });
//                 } else {
//                     define($iface, context);
//                 }
//
//                 if (System.isObject(actions)) {
//                     $iface.$actions = [];
//
//                     // Loop through provided arguments and add them to the 'methods' array
//                     for (var i = 0, len = actions.length; i < len; i++) {
//                         // Check the method name provided is written as a String
//                         if (!isString(actions[i])) {
//                             throw new System.exception.InvalidArgumentException("Interface constructor expects method names to be passed in as a string.");
//                         }
//
//                         // If values is as required then add the provided method name to the method array
//                         $iface.$actions.push(actions[i]);
//                     }
//
//                     delete definition['$actions'];
//                 }
//
//                 $iface = apply($iface, Class.call(this, classpath, def));
//
//                 apply($iface.prototype, def, {
//                     'getClass': function () {
//                         return $iface;
//                     }
//                 });
//
//                 return $iface;
//             }
//         } else {
//             if (classpath && classpath.is(String)) {
//                 if (arguments.length > 2) {
//                     throw new Exception("Invalid arguments number, expected 1 or 2", "InvalidArgumentsException");
//                 }
//
//                 var ns = new Namespace(classpath, def['$container']),
//                     name = ns.getName(), container = ns.getParent();
//
//                 delete def['$container'];
//
//                 try {
//                     $iface = new Interface(name, def);
//                     return Member.register(container.addMember($iface));
//                 } catch (e) {
//                     var unresolved = [];
//                     switch (e.name) {
//                         case "UnresolvedSuperClassException":
//                             if ("$extends" in definition) {
//                                 unresolved.push(definition['$extends']);
//                             }
//
//                             var builderTemp = new Member.BuilderTemp(name, e);
//                             Loader.observe(unresolved, function (error) {
//                                 if (!error) {
//                                     var cls = Interface(classpath, definition);
//                                     return builderTemp.onBuild(cls);
//                                 }
//                             });
//                             return builderTemp;
//                         default:
//                             throw e;
//                     }
//                 }
//             }
//             throw new Exception("Invalid arguments provided, expected (String[, Object]).", "InvalidArgumentsException");
//         }
//         throw new Exception("Cannot explicitly create Interface instances.", "IllegalCallException");
//     }
// });