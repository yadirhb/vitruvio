/**
 * Created by yadirhb on 11/11/2016.
 */
Class('exception.RuntimeException', {
    '$extends' : 'System.Exception',
    'constructor': function (message) {
        this.$super(message || "Execution failed");
    }
})