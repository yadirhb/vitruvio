/**
 * The exception that is thrown when one of the arguments provided to a method is not valid.
 */
Class('exception.InvalidArgumentsException', {
    '$extends': 'System.Exception',
    'constructor': function (message) {
        this.$super(message);
    }
})
