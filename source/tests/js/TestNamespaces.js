/**
 * Created by yadirhb on 11/22/2015.
 */
NoConflict.ready(function(System){
    var Log = System.utils.Log,
        Namespace = System.Namespace,
        Class = System.Class;

    var ns = Namespace.create("Animal");
    System.Loader.register(ns);
    if(ns.getContainer().getContainer() != window) Log.assert(false, "Failed in get container");
    if(ns.getFullPath() != "Animal") Log.assert(false, "Invalid path_module string");


    Namespace("Animal",
        Class("Perro",{
            constructor : function(name){
                this.name = name;
            },
            getName : function(){
                return this.name;
            }
        })
    )

    var nested = System.Namespace.create("Animal.Mammal");

    if(nested.getContainer() != ns) Log.assert(false, "Failed in get container");
    if(nested.getFullPath() != "Animal.Mammal") Log.assert(false, "Invalid path_module string");

    var cannins = nested.addMember(System.Namespace.create("Cannis"));
    if(cannins.getFullPath() != "Animal.Mammal.Cannis") Log.assert(false, "Invalid path_module string");
});