/**
 * Created by yadirhb on 8/29/2016.
 */
try {
    var System = require("../../build/vitruvio-npm/index")

    System.config({
        sourcesSet: ["sandbox/src/"]
    })
} catch (e) {
}

var using = System.using,
    Namespace = using('System.Namespace'),
    Static = using('System.Static'),
    Class = using('System.Class'),
    Interface = using('System.Interface'),
    Exception = using('System.Exception'),
    Type = using('System.reflection.Type'),
    Member = using('System.reflection.Member'),

    Enum = using('System.Enum');


/**
 * The root namespace
 */
Namespace("com.example",
    Enum("Colors", [
        'RED',
        'BLUE',
        'BLACK',
        'WHITE'
    ]),
    Enum("Mobile", {
        Samsung: 200,
        Nokia: 120,
        Huawei: 300
    }),
    Enum("WeekDays", {
        SUNDAY: 'Sunday',
        MONDAY: 'Monday',
        THURSDAY: 'Thursday',
        WEDNESDAY: 'Wednesday',
        TUESDAY: 'Tuesday',
        FRIDAY: 'Friday',
        SATURDAY: 'Saturday'
    }),
    Enum("OtherDays", {
        $values: [
            'Sunday',
            'Monday',
            'Thursday',
            'Wednesday',
            'Tuesday',
            'Friday',
            'Saturday'
        ]
    }),
    Interface("Serializable", {
        'decode': function (byteArray, encodingType) {
        }
    }),
    Interface("Comparable", {
        '$extends': 'Serializable',
        'compareTo': function (obj) {
        }
    }),
    /**
     *    Single inner class
     */
    Class("Chicken", {
        '$extends': "com.example.Animal",// String, Function
        '$implements': "com.example.Comparable",// String, Function, String/Function[]
        'constructor': function (name) {
            this.time = new Date().getTime()
            this.$super(name);
        },
        'compareTo': function (obj) {
            if (obj) {
                if (obj.is(this.getClass())) {
                    if (this.time < obj.time) return -1;
                    else if (this.time == obj.time) return 0;
                    else return 1;
                }
                throw new Exception("The supplied object is not instance of " + this.getClass().getFullPath(), "ClassCastException");
            }
            throw new Exception("The supplied object cannot be null", "NullPointerException");
        },
        'decode': function () {
        },
        'chirp': function () {
            return "pio pio pio";
        }
    }),
    /**
     * Base class for Polygons
     */
    Class("Polygon", {
        'constructor': function (vertexes) {
            if (vertexes && System.isArray(vertexes) && vertexes.length >= 3) {
                this.vertexes = vertexes;
            } else throw new Exception("Polygon constructor expects an array with more than 3 numeric values.", 'InvalidArgumentException');
        }
    })
)

Class("com.example.Square", {
    "$extends": com.example.Polygon,
    'constructor': function (length, coords) {
        coords = coords || [0, 0];
        if (!isArray(coords)) throw new Exception("Array expected.", "InvalidArgumentsException");
    }
})

Static.Class("com.example.Loader", {
    'constructor': function (length, coords) {
        coords = coords || [0, 0];
        if (!isArray(coords)) throw new Exception("Array expected.", "InvalidArgumentsException");
    }
});


System.ready(function (System) {
    var Horse = function Horse() {
        this.run = function () {
            return "running...";
        }
    };

    Class('Pony', {
        'constructor': function () {
            System.apply(this, new Horse());
        }
    })

    var p = new Pony();
    console.log(p.run());

    // try {
    var con = {};

    var triangle = new com.example.Polygon([1, 2, 3]);


    var cls = Class("People", {
        '$extends': "com.example.Animal",
        'constructor': function (name, age) {
            this.$super(name);
            this.age = age;
        },
        'getAge': function () {
            return this.age;
        },
        'getName': function () {
            return "My name is " + this.$super.getName();
        }
    });

    var bcls = Class("com.example.Animal", {
        'constructor': function (name) {
            this.name = name;
        },
        'getName': function () {
            return this.name;
        },
        'isAnimal': function () {
            return "Error";
        }
    });

    try {
        console.log(bcls.getFullPath());
        var a = new People("Yadir", 26);

        var b = new com.example.Chicken("Peter");
        console.log(b.is(com.example.Comparable), "Check interface typeof");

        if (b.is(com.example.Comparable)) {
            console.log(b.chirp())
            var comp = b.as(com.example.Comparable);
            comp.compareTo(b);
            // console.log(b.compareTo(comp), "Comparable out");
        }
        var d = a.as(com.example.Animal);

        var Dog = using('com.appscidentally.helix.Dog', function (Dog) {
            var d = new Dog("Snoopy");
            var classpath = Dog.getFullPath();
            console.log(classpath);
            console.log(using(classpath));
            console.log(d.getName());
        });

        // var s = new Dog("Snoopy");
        // console.log(s.getName());
        // console.log(s.is(Dog));

        console.log(d);
        console.log(d.getName());
        console.log(a.getAge());
        console.log("---------------");
        console.log(b);
        console.log(a.getName());
        console.log(a.getAge());
        console.log(People.is(Type), "Check if is Type instance");
        console.log(People.is(Member), "Check if is Member instance");
        console.log(People.is(Class), "Check if is Class instance");
        // console.log(com.getType());
        console.log(b.getClass().getFullPath());
    } catch (e) {
        console.assert(e instanceof Error, "Instance of Error class");
        console.assert(e instanceof Exception, "Instance of Exception class");
        console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
    }

    try {
        new Class("MyClass");
    } catch (e) {
        console.assert(e instanceof Error, "Instance of Error class");
        console.assert(e instanceof Exception, "Instance of Exception class");
        console.assert(e.name == "IllegalCallException", "Is wrong exception Type, " + e.name);
    }

    try {
        Class("MyClass");
    } catch (e) {
        console.assert(e instanceof Error, "Instance of Error class");
        console.assert(e instanceof Exception, "Instance of Exception class");
        console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
    }

    try {
        Class("MyClass", 1);
    } catch (e) {
        console.assert(e instanceof Error, "Instance of Error class");
        console.assert(e instanceof Exception, "Instance of Exception class");
        console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
    }

    try {
        Class("MyClass", null);
    } catch (e) {
        console.assert(e instanceof Error, "Instance of Error class");
        console.assert(e instanceof Exception, "Instance of Exception class");
        console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
    }

    try {
        Class("MyClass", true);
    } catch (e) {
        console.assert(e instanceof Error, "Instance of Error class");
        console.assert(e instanceof Exception, "Instance of Exception class");
        console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
    }

    try {
        Class("MyClass", undefined);
    } catch (e) {
        console.assert(e instanceof Error, "Instance of Error class");
        console.assert(e instanceof Exception, "Instance of Exception class");
        console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
    }

    try {
        Class("MyClass", function () {
        });
    } catch (e) {
        console.assert(e instanceof Error, "Instance of Error class");
        console.assert(e instanceof Exception, "Instance of Exception class");
        console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
    }

    try {
        Class(1, 2);
    } catch (e) {
        console.assert(e instanceof Error, "Instance of Error class");
        console.assert(e instanceof Exception, "Instance of Exception class");
        console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
    }

    console.log(System.Environment.getInfo());
});
