/**
 * Created by yadirhb on 8/29/2016.
 */
try {
    var System = System || require("vitruvio");
} catch (e) {}

// System's globals
var using = System.using;
var Namespace = using('System.Namespace');
var Static = using('System.Static');
var Class = using('System.Class');
var Interface = using('System.Interface');
var Exception = using('System.Exception');
var Enum = using('System.Enum');

// Main operations

// Load and get the Dog class reference asynchronously
using('com.example.Dog', function(Dog){
	var boxer = new Dog("Snoopy", "Boxer", 5);

	console.log(boxer.getName()) // Snoopy
	console.log(boxer.getSpecie()) // canis - Boxer
});