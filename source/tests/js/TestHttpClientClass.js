/**
 * Created by yadirhb on 2/17/2016.
 */
NoConflict.ready(function(System){
    var Class = System.Class;
    var Log = System.utils.Log;

    var deps = {map:[], getRes : function(){}};
    function using(dep){

    }

    System.Loader.load(["System/utils/Assert"], function(){
        Atom.utils.Assert.fight();
    });

    try {
        var httpClient = new System.network.HttpClient({'url':"http://localhost/www/proxy/proxy.php"});

        httpClient.on('error', function(evt){
            console.log("Error fired %o", evt);
        });

        httpClient.on('message', function(evt){
            Log.log("Response received " + evt.data.toString());
        });

        httpClient.trigger('error',[{error : new System.exception.UnsupportedCORSException()}]);

        httpClient.send();
        //httpClient.close();

        Log.assert(true, httpClient instanceof System.network.BaseClient, "Is not a base client");
        Log.assert(true, httpClient instanceof System.EventEmitter, "Is not a base client");
        Log.assert(true, httpClient.url !== "www.google.com", "Is not the right url");
        /*Log.assert(true, debug.getName() == "Static", "Is not the same value.")
         Log.assert(true, ns.Console.getName() == "Static", "Is not the same value.")*/
    } catch(e){
        console.log(e);
    }
});