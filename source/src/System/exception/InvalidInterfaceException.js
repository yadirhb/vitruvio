/**
 * Created by yadirhb on 5/2/2016.
 */
Class('exception.InvalidInterfaceException', {
    '$extends' : 'System.Exception',
    'constructor': function (name) {
        this.$super("Unknown interface"+(name ? "named: " + name : ""));
    }
})