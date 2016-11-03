/**
 * Defines the base Type class from which extends other strong types such as: Class, Enum.
 * */
function Type(/*[Type]*/) {
    var self = this, signature = arguments[0];
    if (arguments.length > 0) {
        Type.putIfAbscent.call(Type, signature);
        var $type = signature instanceof Function ? new signature : new Type;

        self.getType = function () {
            return $type;
        }

        self.isInstanceOf = function (subject) {
            var _isIt = false;
            if (isFunction(subject)) {
                if ($type instanceof subject) return true;
            }
            return _isIt;
        }
    }
    return self;
}

apply(Type, {
    'signatures': [Type],
    'putIfAbscent': function () {
        for (var i in arguments)
            if (Type.signatures.indexOf(arguments[i]) == -1)
                Type.signatures.push(arguments[i]);
    },
    'isRegistered': function (type) {
        return type && 'getType' in type && Type.signatures.indexOf(type.getType()['constructor']) != -1;
    }
});

function Member(/*[Type]*/) {
    if (arguments.length > 0) {
        var $type = arguments[0], self = typeof(this) == 'undefined' || this == $global ? {} : this,
            name = arguments[1] || (self || self.prototype)['constructor']['name'],
            container = arguments[2], def = arguments[3];

        Type.apply(self, [$type || Member]);

        // apply(self, new Member);

        function isRootMember() {
            if (container == $global) {
                return true;
            } else {
                if (self.$namespace == $global) return true; // Global
            }

            return false;
        }

        self.getName = function () {
            return self.$name;
        }
        self.getContainer = function () {
            return container
        };
        self.setContainer = function (c) {
            if (c) container = c;
        }
        self.getFullPath = function () { // global.A.B.C; A.B.C
            var path;

            if (isRootMember()) {
                return "";
            }
            else if (self.isInstanceOf(Member)) {
                if (!container || (container.isInstanceOf(Namespace) && container.getContainer() == $global)) return self.$name;
                else path = container.getFullPath() + "." + self.$name;
            }

            return path;
        }

        self.getContext = function () {
            return def == $global ? def : self;
        }
        self.$namespace = def || self;
        self.$name = name;
        self.$classpath = self.getFullPath();

        return self;
    }
}

define(Member, new Type(Member), {
    'hasMembers': false,
    'getName': function () {
        return this.$name;
    },
    'getMember': function (member) {
        // if(typeof member !== 'string' &&
        // !Core.RegExp.Identifier.test(member))
        // throw new Error("[InvalidArgumentException]");
        return this.getContext()[member];
    },
    'hasMember': function (member) {
        return this.getMember(member) != undefined;
    },
    'addMember': function (typeDef) {
        // if("$namespace" in this){
        var isRegistered = Type.isRegistered.call(Type, this[typeDef.$name]);
        if (isRegistered) {
            //throw new Exception("Another member is already registered with the name: '"	+ typeDef.$classpath + "'", "RegisteredNamespaceMemberException");
        }
        return this[typeDef.$name] = typeDef;
        // }
    },
    'removeMember': function (member) {
        if ('$name' in member) {
            var m = this.getContext()[member.$name];
            if (m) {
                try {
                    delete this.getContext()[member.$name];
                } catch (error) {
                    this.getContext()[member.$name] = undefined;
                }
                //this.hasMembers = false;
                return m;
            }
        }
    }
});

function Namespace(/*[Type]*/) {
    if (arguments.length > 0) {
        var self = typeof(this) == 'undefined' || this == $global ? Namespace : this,
            name = arguments[0], def = arguments[1];
        if (!Loader.isRegistered(name)) {
            Member.call(self, Namespace, name, def, arguments[2]);

            self.addMember = function (member) {
                if (member.isInstanceOf(Member)) {
                    if (def == $global) {
                        return def[member.$name] = member;
                    } else {
                        var container = member.$namespace.getContainer();
                        if (container) {
                            container.removeMember(member);
                        }

                        member.setContainer(self);
                        return Member.prototype.addMember.call(self, member);
                    }
                }
            }

            // if(def == $global){
            // 	self.getMember = function(member){
            // 		return def[member];
            // 	}
            //
            // 	self.removeMember = function(member){
            // 		if('$name' in member){
            // 			var m = def[member.$name];
            // 			if (m){
            // 				try {
            // 					delete def[member.$name];
            // 				} catch(error){
            // 					def[member.$name] = undefined;
            // 				}
            // 				//this.hasMembers = false;
            // 				return m;
            // 			}
            // 		}
            // 	}
            // }
        } else {
            self = Loader.getResource(name);
        }

        if (def && ('getType' in def)) {
            var $type = def.getType();
            if ($type instanceof Member && !($type instanceof Namespace)) {
                self.addMember(def.getContainer().removeMember(def))
            }
        }

        return self;
    }
}

define(Namespace, new Member(Namespace), undefined, {
    /**
     * Defines a new member and registers it into the wrapper object.
     *
     * @param name
     *            {String} The name of the member to be defined. It must be a valid
     *            namespace identifier.
     * @param wrapper
     *            {Object} Defines the wrapper of the new Object, if not provided
     *            window will be taken.
     */
    "create": function (/*name, wrapper*/) {
        var ns = arguments[0];
        var wrapper = arguments[1] || $global;

        if (!(ns && typeof ns === 'string')
            || !(wrapper && typeof wrapper === 'object' || typeof wrapper === 'function'))
            throw new Exception("Expected type (String, [Object | Function]) to build a namespace.", "InvalidArgumentException");

        if (!(/^@?[a-z_A-Z]\w+(?:\.@?[a-z_A-Z]\w+)*$/.test(ns)))
            throw new Exception("Invalid  class name: '" + ns + "'", 'InvalidClassNameException');

        var nsparts = ns.split(".");

        // loop through the parts and create a nested namespace if necessary
        while (nsparts.length > 0) {
            var node = nsparts.shift();
            // check if the current parent already has the namespace declared
            // if it isn't, then create it

            if (!(wrapper instanceof Member)) {
                if (wrapper[node] && wrapper[node] instanceof Member)
                    wrapper = wrapper[node].getContainer();
                else {
                    var name = '$name' in wrapper ? wrapper.$name : ("hasOwnProperty" in wrapper && wrapper.hasOwnProperty("constructor")) ? getClassName(wrapper.constructor)
                        : wrapper == $global ? "Global" : wrapper.prototype ? getClassName(wrapper.prototype) : "Namespace";
                    wrapper = new Namespace(name, wrapper, wrapper);
                }
            }

            if (!(wrapper.hasMember(node))) {
                // wrapper[node] = {};//
                wrapper.addMember(new Namespace(node, wrapper));
            }

            // get a reference to the deepest element in the hierarchy so far
            // wrapper = wrapper[node];//
            wrapper = wrapper.getMember(node);
        }

        // the parent is now constructed with empty namespaces and can be used.
        // we return the outermost namespace
        return wrapper;
    }
});

var map = {};
function Loader(/*Loader*/) {
}

System.Loader = Loader;

Loader.Record = function ($path, $obj) {
    var self = this;
    this.$path = $path;
    this.$obj = $obj;

    this.register = function () {
        var reg = map[self.$path] = this.$obj;
        // Fire onregistered event
        emitEvent.call(Loader, 'memberRegistered', [self.$path]);
    }

    return this;
}

apply(Loader, {
    'observers': {},
    'setOnMemberLoaded': function (member, func) {
        var observer = this.observers[member];
        if (!observer || !isArray(observer)) {
            observer = this.observers[member] = []
        }
        ;
        return observer.push(func);
    },
    'register': function () {
        if (arguments.length > 0) {
            var collection = [], $path = arguments[0], $obj = arguments[1], record;

            if (arguments.length == 1 && Type.isRegistered($path)) {
                collection.push({'$path': $path['$classpath'], '$obj': $path});
            } else if (arguments.length == 2) {
                collection.push({'$path': $path, '$obj': $obj});
            } else {

            }

            collection.each(function (member) {
                if (!map[member.$path]) {
                    var record = new System.Loader.Record(member.$path, member.$obj);
                    record.register();
                }
            });

            return true;
        }
    },
    'isRegistered': function (res) {
        res = isString(res) ? this.getResource(res) : res || this;
        return res && (isObject(res) || isFunction(res)) && map[res.$classpath];
    },
    'getResource': function (res) {
        return map[res];
    },
    'getResources': function () {
        return map;
    }
});

/**
 *
 * */
function onMemberRegistered(member) {
    var observers = this.observers[member];
    if (observers) observers.each(function (func) {
        func(member);
    });
}
addListener.call(Loader, 'memberRegistered', onMemberRegistered);

function checkDependencies(dependency, args) {
    try {
        return using(dependency, function (dep) {
            //console.error("When class <" + dep + "> is loaded!");
            var ns = Namespace.create(args[0], args[1]['$namespace'] || System.ROOT_NS);
            var classpath = ns.getFullPath();
            var member = System.Loader.getResource(classpath);
            if (!member) Class(args[0], args[1]);
        });
    } catch (e) {
        throw e;
    }
    return false;
}

function Class(/*[Type]*/) {
    if (arguments.length > 0) {
        var classpath = arguments[0], typeDef = arguments[1], avoidBuilding = arguments[2] === true, $type = arguments[3] || Class,
            definition = apply({}, typeDef), ns = Namespace.create(classpath, definition['$namespace'] || System.ROOT_NS),
            name = ns.getName(), container = ns.getContainer(), base, construct, $ifaces = [], $static = definition.$static,
            CustomType = function CustomType(/*CustomType*/) {
                return this;
            }, signature = $type.name || name;

        delete definition.$static;

        eval("CustomType = function " + name + "(/*[" + signature + "]*/){ return this; }");
        var self = typeof(this) == 'undefined' || this == $global || this == System ? define(CustomType, new $type) : this;

        if ('$namespace' in definition) delete definition['$namespace'];

        if ('constructor' in definition && definition.hasOwnProperty('constructor')) {
            construct = definition.constructor;
            delete definition.constructor;
        }

        if ('$extends' in definition) {
            switch (typeof definition['$extends']) {
                case 'string':
                    definition['$extends'] = checkDependencies(definition['$extends'], arguments);
                    if (!definition['$extends']) return;
                case 'function':
                    base = definition['$extends'];
                    delete definition['$extends'];
                    break;
                default:
                    throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(definition['$extends'])['constructor']['name']);
            }

            if (construct == undefined) construct = base;
        }

        if (!avoidBuilding) {
            if ('$implements' in definition) {
                function collectIfaces(iface) {
                    if (isString(iface)) {
                        var name = iface;
                        iface = checkDependencies(iface, arguments);
                        if (!iface) throw new System.exception.InvalidInterfaceException(name);
                    }

                    if (iface instanceof Function) {
                        $ifaces.push(new iface);
                    } else throw new System.exception.InvalidSuperClassException(Object.getPrototypeOf(iface)['constructor']['name']);
                }

                if (isArray(definition['$implements'])) {
                    each(definition['$implements'], function (iface) {
                        collectIfaces(iface);
                    })
                } else collectIfaces(definition['$implements']);

                delete definition['$implements'];
            }

            if (typeof(this) === 'undefined' || this === $global || this === System) {

                if (construct == undefined) construct = CustomType;

                var $class = (function (base) {
                    var func;
                    eval("func = function " + name + "(/*[Class]*/){" +
                        "if(base) this.$super = base;" +
                        "construct.apply(this, arguments);" +
                        "if(typeof(base) === 'function'){" +
                        "this.$super = apply(new base, this);" +
                        "}" +
                        "return this;" +
                        "};");
                    return func;
                })(base);

                if (base) {
                    define($class, new (define(CustomType, base.prototype))(), false, apply({
                        '$superclass': base
                    }, $static));
                }

                $class = Class.apply($class, arguments);

                apply($class.prototype, definition, {
                    'getClass': function () {
                        return $class;
                    }
                });

                each($ifaces, function (iface) {
                    System.Interface.ensureImplements($class, iface);
                });

                return container.addMember($class);
            }
        }

        // Super type
        Member.call(self, $type, name, container, ns);

        self.getClass = function () {
            return this;
        }

        self.getAllMethods = function () {
            var methods = [];
            var $super = self;

            while ($super = $super.$superclass) {
                $super.getAllMethods().each(function (method) {
                    methods.push(method);
                });
            }

            self.getDeclaredMethods().each(function (method) {
                methods.push(method);
            });
            return methods;
        }

        self.getDeclaredMethods = function () {
            var methods = [];
            for (var m in typeDef)
                if (typeDef.hasOwnProperty(m) && typeof typeDef[m] == 'function') {
                    var method = typeDef[m];
                    apply(method, {'name': m});
                    methods.push(method);
                }
            return methods;
        }

        self.getInterfaces = function () {
            return $ifaces;
        }

        self.isInstanceOf = function (subject) {
            var _isIt = false;
            if (isFunction(subject)) {
                if (self.getType() instanceof subject) return true;
                else if (subject.prototype instanceof System.Interface) {
                    self.getInterfaces().each(function (iface) {
                        if (iface instanceof subject) return _isIt = true;
                    });
                }
            }
            return _isIt;
        }

        self.$registered = System.Loader.register.call(self, self);
        return self;
    }
    // Defines a empty class Type instance
}

define(Class, new Member(Class), {
    'setMethod': function (name, func, visibility) {
        this.prototype[name] = func;
        return this;
    }
}, {
    'checkDependenciesLoaded': function () {

    }
});


/**
 * Static classes reference
 * */
var Static = {
    'Class': function () {
        var cls = Class(arguments[0], arguments[1]);
        var cnt = cls.$namespace.getContainer();
        cnt.removeMember(cls);
        cnt.addMember(freeze(apply(cls, cls.prototype)));
    }
};

/** Core publishing section */
System = new Namespace($root);
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
System.hasProp = hasProp;
System.getOwn = getOwn;
System.using = using;
System.freeze = freeze;
System.alias = alias;
System.bind = bind;
System.apply = apply;
System.mixin = mixin;
System.setRootNamespace = function (ns) {
    return System.ROOT_NS = ns;
}
System.enableDebug = function (enable) {
    System.DEBUG = true === enable;
}
System.DEBUG = false;

System.Loader = Loader;
System.Static = Static;

System.Type = Type;
Loader.register($root + '.Type', Type);

System.Member = Member;
Loader.register($root + '.Member', Member);

/**
 * Defines a new class and registers it into the context object.
 *
 * @param className
 *            {String} The name of the member to be defined. It must be a valid
 *            namespace identifier.
 * @param definition
 *            {Object} Contains the public class members.
 * */

System.Class = Class;
Loader.register($root + '.Class', Class);

System.Namespace = Namespace;
Loader.register($root + '.Namespace', Namespace);

System.setRootNamespace(System);

/**
 * XT roots a temporal System namespace for extensions.
 * */
var xt = new Namespace("System");