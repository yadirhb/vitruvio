/**
 * Created by yadirhb on 12/15/2015.
 */
Class('exception.IllegalCallException',{
    '$extends' : 'System.Exception',
    'constructor': function (message) {
        this.$super(message || "Default exception if a function was called while the object is not in a valid state for that function.");
    }
})
