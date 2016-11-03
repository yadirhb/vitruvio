/**
 * Constructor that creates a new Enumerator object for checking a function implements the required methods.
 * @param objectName | String | the instance name of the Enumerator
 * @param methods | Array | methods that should be implemented by the relevant function
 */
function Enumerator(/*[Type]*/) {
    var classpath = arguments[0], definition = arguments[1], def = apply(isArray(definition) ? [] : {}, definition), $enum;
    if (this.is(Enumerator)) {
        if (arguments.callee.caller == Enumerator) { //Instantiation of classes objects)
            var context = this, CustomType = eval("CustomType = function " + classpath + "(/*[Enumerator]*/){ return context; }"), values = '$values' in def ? def['$values'] : def || [];

            delete def['$values'];

            $enum = (function () {
                var func;
                eval("func = function " + classpath + "(/*[Enumerator]*/){}");
                return func;
            })();

            define($enum, context);

            // prepare a 'self' object to return, so we work with an object instead of a function
            $enum.values = [];     // prepare a list of values indices

            if (isArray(values)) {
                $enum.keys = values; // create the list of values keys

                values.each(function (val, i) {
                    $enum[val] = i;
                    $enum.values.push(i);
                });

            } else if (!isFunction(values) && isObject(values)) {
                $enum.keys = [];
                for (var i in values) {
                    if (values.hasOwnProperty(i)) {
                        if (!isFunction(values[i])) {
                            $enum.keys.push(i);
                            $enum.values.push(values[i]);     // add the index to the list of values indices
                        }
                        $enum[i] = values[i]; // add the variable to this object
                    }
                }
            }

            Member.call($enum.prototype, classpath, undefined, Interface);

            $enum = apply($enum, this, clsMembers);

            var cleanDef = removeKeyWords(def);

            apply($enum.prototype, cleanDef, {
                '$class': $enum,
                '$def': cleanDef
            });

            return $enum;
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
                $enum = new Enumerator(name, def);
                return Member.register(container.addMember($enum));
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

Loader.register($root + '.reflection.Enumerator', define(Enumerator, Member, {
    'contains': function (val) {
        return this.valueOf(val) != undefined;
    },
    'valueOf': function (val) {
        if (this.keys) {
            for (var i in this) {
                if (!isFunction(this[i]) && this[i] == val) return this[i];
            }
        }
    }
}))

Loader.register($root + '.Enum', function () {
    return Enumerator.apply(arguments.callee, arguments);
});