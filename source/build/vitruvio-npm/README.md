## How to use
Easy to use, first of all you need to set up the ready state to begin:
Add a tag 'script' with the "src" attribute value: src="https://github.com/yadirhb/System.JS/branches/development/sources/System/build/system-0.1.0.min.js"

and then start defining your own classes and so:

## Subscribe into System ready callback, which fires when document is ready.
	System.ready(function(System){
		// Aliasing the Class function out of System namespace.
		// It allows to get more cool appearance like Classes supported languages (Java, C#)
		var using = System.using;
			
		var Class = using("System.Class");
	}

## Defining a class:
Inside the ready callback..

	System.ready(function(System){
		var using = System.using;
		var Class = using("System.Class");
		
		Class("Animal.Mammal",{
   			"name" : "Mammal",
   			"constructor" : function(name){
				this.name = name;
   			},
   			"getName" : function(){
				return this.name;
   			}
		});
	}

## Creating objects:
Once defined our class, now you can instantiate objects of it.

	var mammal = new Animal.Mammal("Dog");
	mammal.getName(); // Will produce: Dog

## Extending our classes
You can extend a previusly created class by using the definition key $extends and by providing the full className as a string or the class reference directly:
	
	Class("Animal.Dog", {
		"$extends": "Animal.Mammal",
		"constructor" : function(name, owner){					
			this.$super(name); // Calling the super constructor
			this.owner = owner;
		},
		'getOwner' : function(){
			return this.owner;
		}
	});
	
	or ...
	
	Class("Animal.Dog", {
		"$extends": Animal.Mammal,
		"constructor" : function(name, owner){					
			this.$super(name);
			this.owner = owner;
		},
		'getOwner' : function(){
			return this.owner;
		}
	});
	
Then instantiate the classes:

	var dog = new Animal.Dog("Snoopy","Charlie Brown");
	dog.getName() // Will produce: Snoopy
	dog.getOwner() // Will produce: Charlie Brown
	
## Overriding superclass methods
You can override methods in the inherited classes, and call super implementation easily.

	Class('Animal.Dog.Beagle',{
		'$extends': 'Animal.Dog',
		'getOwner' : function(){
			return "Mr." + this.$super.getOwner();
		}
	})
Once again instantiate the class, but this time as a Beagle
	
	var dog = new Animal.Dog.Beagle("Snoopy","Charlie Brown");
	dog.getName() // Will produce: Snoopy
	dog.getOwner() // Will produce: Mr. Charlie Brown


## Creating a root namespace
By default all definitions will be stored into the global namespace; in browsers it's the global object window. This behaviour can be 
handled and it is possible to store the classes in different namespaces.

For example, create an object that will be the root namespace 'ns' for a class:

	var ns = {};
	
then if is defined a new class 'MyClass' it can be stored in the ns object by using the $namespace keyword as follows:

	Class('MyClass',{
		$namespace : ns,
		constructor : function(){
			// Todo...
		}
	})
	
and so on with all classes or other types of definitions you wanted to store, remember if you don't define a $namespace root the global object will be used.

There's a more comfortable way to accomplish such goal, and it is by using the System.setRootNamespace(Object) method which will set the main root for all the classes and enumerators. So use System.setRootNamespace(Object) once instead of provide a $namespace in every definition as follows:

	//Aliasing System classes
	var Class = System.Class;
	var Static = System.Static;
	var Enum = System.Enum;
	
	// Define your own namespace
	var ns = {};
	// Setting the System definition engine to use the namespace 'ns'.
	System.setRootNamespace(ns);
	
	// Defining classes
	Class('media.VideoConverter',{
		constructor : function(source){
			// TODO ...
		}
	})
	
	Static.Class('utils.Tools',{
		blobToArray : function(aBlob){
			var binary = '';
        		var bytes = new Uint8Array(aBlob);
        		var len = bytes.byteLength;
        		for (var i = 0; i < len; i++) {
            			binary += String.fromCharCode(bytes[i]);
        		}
        		var audioBytes = global.btoa(binary);
        		return audioBytes;
		}
	})

	Enum('common.WeekDays',[
		'MONDAY',
		'TUESDAY,
		'WEDNESDAY',
		'THURSDAY',
		'FRIDAY',
		'SATURDAY',
		'SUNDAY'
	])
	
	// Then yor can use the classes and enums
	
	var videoConverter = new ns.media.VideoConverter();
	
	var _array = ns.utils.Tools.blobToArray(new Blob());
	
	if(today === ns.common.WeekDays.WEDNESDAY) {
		// TODO ...
	}
	
#Test results

	System.ready(function(System){
		var using = System.using;
		var Class = using("System.Class");
		
		Class("Animal.Mammal",{
   			"name" : "Mammal",
   			"constructor" : function(name){
				this.name = name;
   			},
   			"getName" : function(){
				return this.name;
   			}
		});
		
		Class("Animal.Dog", {
			"$extends": "Animal.Mammal",
			"constructor" : function(name){					
				this.$super(name);
			}
		});
				
		Class("Animal.Dog.Tinny",{
			"$extends": "Animal.Dog",
			"constructor" : function(name){					
				this.$super(name);
			},
			"getName" : function(){
				return this.name + " something";
			}
		});
				
		Class("Animal.Dog.Chiguagua",{
			"$extends": "Animal.Dog.Tinny",
			"constructor" : function(name){					
				this.$super(name);
			}
		});
				
		Class("Exception.MyException",{					
			"$extends" : System.Exception,
			'constructor' : function(message){
				this.$super(message,"MyException");
			}
		});
				
		/// Test Super Class
		try {
			Class("RuntimeException",{						
				'$extends' : 1
			})
		} catch(e){
			console.assert(true, e.name == "InvalidSuperClassException");
		}
				
		try {
			Class("RuntimeException",{						
				'$extends' : true
			})
		} catch(e){
			console.assert(true, e.name == "InvalidSuperClassException");
		}
				
		var errVal = "The parameters should be greats man";
		var ex = new Exception.MyException(errVal);
		try {
			throw ex;
		} catch(e) {
			console.assert(true, e instanceof Error, "e is not instanceof Error");
			console.assert(true, e instanceof System.Exception, "e is not instanceof System.Exception");
			console.assert(true, System.Exception instanceof Error, "System.Exception is not instanceof Error");
			console.log(true, e.name.toString() === "MyException", "e.name {"+e.name+"} not asserted to {MyException}");
			console.log(true, e.message === errVal, "e.message {"+e.message+"} not asserted to {"+errVal+"}");
		}
				
		var m = new Animal.Mammal("TestMammal");
		
		console.log(true,Animal.Mammal.getAllMethods().length == 2);
		console.log(true,Animal.Mammal.getAllMethods().length == m["$class"].getAllMethods().length);
		
		var a = new Animal.Dog.Chiguagua("Dinky");
		console.assert(true, a.$super.$super instanceof Animal.Mammal, "Super instance is not the right type");
		console.assert(true, a.getName() == "Dinky something");			
