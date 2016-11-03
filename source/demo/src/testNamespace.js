/**
 * Created by yadirhb on 8/27/2016.
 */
try {
    var System = require("./.././system");
} catch (e) {
}

var using = System.using,
    Namespace = using('System.Namespace'),
    Exception = using('System.Exception'),
    Member = using('System.reflection.Member');


var wrapper = {
    'wrapper': function () {
    }
}

var ns = new Namespace("com.example", wrapper.wrapper);
console.log(typeof (ns) != "undefined", "Check if exists");
console.log(ns.is(Namespace), "Check if is Namespace instance.");
console.log(ns.is(Member), "Check if is Member instance.");
console.log(wrapper.wrapper.com.getContainer() == wrapper.wrapper, "Check if the instances are the same.");
console.log(ns.getName());

var con = {};
var ns = new Namespace("com.example", con);
console.log(typeof (ns) != "undefined", "Check if exists");
console.log(ns.is(Namespace), "Check if is Namespace instance.");
console.log(ns.is(Member), "Check if is Member instance.");
console.log(ns == con.com.example, "Check if the instances are the same.");
console.log(ns.getName());

try {
    var ns = new Namespace("com.example.net", con);
    console.log(typeof (ns) != "undefined", "Check if exists");
    console.log(ns.is(Namespace), "Check if is Namespace instance.");
    console.log(ns.is(Member), "Check if is Member instance.");
    console.log(ns == con.com.example.net, "Check if the instances are the same.");
    console.log(ns.getName());
    console.log(ns.getFullPath());
} catch (e) {
    console.log(e);
}

try {
    function wrapper() {
    }

    var a = new Namespace("com.example", wrapper);

    console.log(typeof (wrapper.com) != "undefined", "There no such 'com' namespace.");
    console.log(wrapper.com.is(Namespace), "The 'com' is not a namespace.");
    console.log(typeof (wrapper['com']['example']) != "undefined", "There no such 'com.example' namespace.");
    console.log(wrapper.com.example == a, "The provided namespace 'com.example' instance is not the same as the provided one");
    console.log(wrapper.com.example.is(Namespace), "There no such 'com.example' namespace.");
} catch (e) {
    console.assert(e.is(Error), "Instance of Error class");
    console.assert(e.is(Exception), "Instance of Exception class");
    console.assert(e.name == "InvalidTypeException", "Is wrong exception Type, " + e.name);
}

try {
    var wrapper = {};

    var a = new Namespace("com.example", wrapper);

    console.log(typeof (wrapper.com) != "undefined", "There no such 'com' namespace.");
    console.log(wrapper.com.is(Namespace), "The 'com' is not a namespace.");
    console.log(typeof (wrapper.com.example) != "undefined", "There no such 'com.example' namespace.");
    console.log(wrapper.com.example == a, "The provided namespace 'com.example' instance is not the same as the provided one");
    console.log(wrapper.com.example.is(Namespace), "There no such 'com.example' namespace.");
} catch (e) {
    console.assert(e.is(Error), "Instance of Error class");
    console.assert(e.is(Exception), "Instance of Exception class");
    console.assert(e.name == "InvalidTypeException", "Is wrong exception Type, " + e.name);
}

// Type tests

try {
    function Douglas() {
    }

    Namespace(Douglas);
} catch (e) {
    console.assert(e.is(Error), "Instance of Error class");
    console.assert(e.is(Exception), "Instance of Exception class");
    console.assert(e.name == "InvalidTypeException", "Is wrong exception Type, " + e.name);
}

try {
    Namespace(12);
} catch (e) {
    console.assert(e.is(Error), "Instance of Error class");
    console.assert(e.is(Exception), "Instance of Exception class");
    console.assert(e.name == "InvalidTypeException", "Is wrong exception Type, " + e.name);
}

try {
    Namespace(true);
} catch (e) {
    console.assert(e.is(Error), "Instance of Error class");
    console.assert(e.is(Exception), "Instance of Exception class");
    console.assert(e.name == "InvalidTypeException", "Is wrong exception Type, " + e.name);
}

try {
    Namespace(undefined, null);
} catch (e) {
    console.assert(e.is(Error), "Instance of Error class");
    console.assert(e.is(Exception), "Instance of Exception class");
    console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
}

try {
    Namespace(null);
} catch (e) {
    console.assert(e.is(Error), "Instance of Error class");
    console.assert(e.is(Exception), "Instance of Exception class");
    console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
}

try {
    Namespace();
} catch (e) {
    console.assert(e.is(Error), "Instance of Error class");
    console.assert(e.is(Exception), "Instance of Exception class");
    console.assert(e.name == "InvalidArgumentsException", "Is wrong exception Type, " + e.name);
}
