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
                        throw new System.exception.InvalidArgumentsException("Interface constructor expects method names to be passed in as a string.");
                    }

                    // If values is as required then add the provided method name to the method array
                    $iface.$actions.push(actions[i]);
                }

                delete definition['$actions'];
            }

            Member.call($iface.prototype, classpath, undefined, Interface);

            $iface = apply($iface, this, clsMembers);

            var cleanDef = removeKeyWords(def);

            apply($iface.prototype, cleanDef, {
                '$class': $iface,
                '$def': cleanDef
            });

            return $iface;
        }
    } else {
        if (classpath && classpath.is(String)) {
            if (arguments.length > 2) {
                throw new System.exception.InvalidArgumentsException("Invalid arguments number, expected 1 or 2");
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
    throw new System.exception.IllegalCallException("Cannot explicitly create Interface instances.");
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
            var methods = $iface.$class.getAllMethods();
            for (var j = 0, methodsLen = methods.length; j < methodsLen; j++) {

                var method = methods[j], name = method.getName();

                // Check method name exists and that it is a function (e.g. test[getTheDate])

                // if false is returned from either check then throw an error
                if (!(name in $class['prototype']) || !isFunction($class['prototype'][name])) {
                    throw new Exception("'" + $class.getFullPath() + "' does not implement interface member '" + $iface.getFullPath() + "." + method.getSignature() + "'.", "NotImplementedException");
                }
            }
        }
    }
});

Loader.register($root + '.Interface', Interface);