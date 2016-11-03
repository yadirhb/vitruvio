/**
 * Created by yadirhb on 2/17/2016.
 */
Class('exception.TimeoutException', {
    '$extends' : 'System.Exception',
    'constructor': function (message) {
        this.$super(message || "Operation timeout.");
    }
})