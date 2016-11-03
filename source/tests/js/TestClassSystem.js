/**
 * Created by yadirhb on 12/16/2015.
 */

NoConflict.ready(function(System){
    var Static = System.Static;
    var Class = System.Class;
    var Interface = System.Interface;
    var Log = System.utils.Log;
    var ns = new System.Namespace("Empty");

    Static.Class('Console',{
        '$namespace' : ns,
        'getName' : function(){
            return "Static";
        }
    })

    var debug = new ns.Console();
    Log.assert(true, debug instanceof ns.Console, "Is not a class");
    Log.assert(true, debug.getName() == "Static", "Is not the same value.")
    Log.assert(true, ns.Console.getName() == "Static", "Is not the same value.")


    System.setRootNamespace(window);

    Class('Atom.Shape',{
        'constructor': function(vertexes){
            this.vertexes = vertexes;
        },
        'getVertexes' : function(){
            return this.vertexes;
        }
    });

    System.setRootNamespace(undefined);

    Interface("IComparable", {
        'compare' : function(){}
    });

    Interface("Atom.OnLoadListener", ['onLoad']);

    Interface("IParselable",{
        '$extends' : IComparable,
        'parse' : function(){}
    })

    Class('Atom.Cyrcle',{
        '$extends' : Atom.Shape,
        '$implements' : [IParselable, Atom.OnLoadListener],
        'constructor': function(){
            this.$super(-1);
        },
        'compare' : function(){},
        'onLoad' : function(){},
        'parse' : function(){}
    });

    var shape = new Atom.Shape([1,1]);

    var cyrcle = new Atom.Cyrcle();

    console.assert(cyrcle.getClass().isInstanceOf(IComparable));
    console.log(cyrcle.getVertexes());
});