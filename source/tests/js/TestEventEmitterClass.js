/**
 * Created by yadirhb on 2/17/2016.
 */
NoConflict.ready(function(System){
    var Class = System.Class;
    var Log = System.utils.Log;


    Class('MyEventEmitter',{
        '$extends' : System.EventEmitter,
        'on2': function(evt, listener){
            this.on(evt, listener);
        }
    });

    var eventEmitter = new MyEventEmitter();

    eventEmitter.on2('flush', function(a, b, c){
        console.log("Flushed with %s",a);
    });

    eventEmitter.addListener('flush', function(a, b, c){
        console.log("Flushed again with %s", b);
    });

    eventEmitter.once('flush', function(a, b, c){
        console.log("Flushed once with %s", c);
    });

    eventEmitter.trigger('flush',[0,1,2,3]);
    eventEmitter.trigger('flush',[9,8,7,6]);



    /*var ns = new System.Namespace("Empty");

    Static.Class('Console',{
        '$namespace' : ns,
        'getName' : function(){
            return "Static";
        }
    })

    var debug = new ns.Console();
    Log.assert(true, debug instanceof ns.Console, "Is not a class");
    Log.assert(true, debug.getName() == "Static", "Is not the same value.")
    Log.assert(true, ns.Console.getName() == "Static", "Is not the same value.")*/
});