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

        var wsClient = new System.network.WebSocketClient({'url':"wss://service-dev.sonicauth.com:9443/subscribe?token=qweqweq123123123123123123qweasdasdasd"});

        wsClient.on('open', function(){
            console.log(wsClient == this);
            this.send(JSON.stringify({
                requestId: (new Date).getTime(),
                action:"sync",
                web_client: "0000x0000012",
                arguments : JSON.stringify({
                    'manufacturer':'Google',
                    'model': 'Chrome'
                })
            }));
        });

        wsClient.on('close', function(evt){
            console.log(wsClient == this);
        });

        wsClient.on('error', function(evt){
            console.log("Error fired %o", evt);
        });

        wsClient.on('message', function(evt){
            console.log("Message obtained from server: %s", evt.data);
            this.close(3055, "Closed by application.");
        });


        Log.assert(true, wsClient instanceof System.network.BaseClient, "Is not a base client");
        Log.assert(true, wsClient instanceof System.EventEmitter, "Is not a base client");
        Log.assert(true, wsClient.url !== "www.google.com", "Is not the right url");
        /*Log.assert(true, debug.getName() == "Static", "Is not the same value.")
         Log.assert(true, ns.Console.getName() == "Static", "Is not the same value.")*/
    } catch(e){
        console.log(e);
    }
});