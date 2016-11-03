/**
 * Created by yadirhb on 5/2/2016.
 */
Class('exception.InvalidSuperClassException', {
    '$extends' : 'System.Exception',
    'constructor': function (name) {
        this.$super("Invalid super class type"+(name ? ", cannot be an instance of: " + name : ""));
    }
})