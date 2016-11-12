/**
 * Created by yadirhb on 8/29/2016.
 */
try {
    System = require("vitruvio");
} catch (e) {
}

// System's globals
using = System.using;
Namespace = using('System.Namespace');
Static = using('System.Static');
Class = using('System.Class');
Interface = using('System.Interface');
Exception = using('System.Exception');
Enum = using('System.Enum');

// Main operations

// Load and get the Dog class reference asynchronously
using('com.example.Dog', function (Dog) {
    var boxer = new Dog("Snoopy", "Boxer", 5);

    console.log(boxer.getName()) // Snoopy
    console.log(boxer.getSpecie()) // canis - Boxer
});

using('System.utils.ExtensionExample', function (ExtensionExample) {
    console.log(new ExtensionExample("The amazing thing!!!").getData())
})