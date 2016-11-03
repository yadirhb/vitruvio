/**
 * Created by yadirhb on 2/17/2016.
 *
 * Base class for extending all network implementations. This is a suitable interface to standardize.
 *
 * @event open
 *      This event occurs when socket connection is established.
 * @event message
 *      This event occurs when client receives data from server.
 * @event error
 *      This event occurs when there is any error in communication.
 * @event close
 *      This event occurs when connection is closed.
 */
Class('network.BaseClient', {
    '$extends' : 'System.EventEmitter',
    'constructor': function (url, protocol) {
        this.url = url;
        this.protocol = protocol;

        this.defineEvents(["open","message","error","close"]);
    },
    /**
     * Represents the state of the connection. It can have the following values:
     *      0 indicates that the connection has not yet been established.
     *      1 indicates that the connection is established and communication is possible.
     *      2 indicates that the connection is going through the closing handshake.
     *      3 indicates that the connection has been closed or could not be opened.
     * */
    'getReadyState' : function(){
        throw new System.Exception("Implement this method into " + this.getClass().$name);
    },
    /**
     * The send(data) method transmits data using the connection.
     * */
    'send':function(data){
        throw new System.Exception("Implement this method into " + this.getClass().$name);
    },
    /**
     * The close() method would be used to terminate any existing connection.
     * @param code Optional
     *      A numeric value indicating the status code explaining why the connection is being closed. If this parameter
     * is not specified, a default value of 1000 (indicating a normal "transaction complete" closure) is assumed. See
     * the list of status codes on the CloseEvent page for permitted values.
     * @param  reason Optional
     *      A human-readable string explaining why the connection is closing. This string must be no longer than 123 bytes
     * of UTF-8 text (not characters).
     * */
    'close' : function(code, reason){
        throw new System.Exception("Implement this method into " + this.getClass().$name);
    }
})