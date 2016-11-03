/**
 * Created by yadirhb on 2/19/2016.
 */
Class('exception.XMLException', {
    '$extends' : System.Exception,
    'constructor': function(message){
        this.$super(message || "Error during the XML transformation process.");
    }
})