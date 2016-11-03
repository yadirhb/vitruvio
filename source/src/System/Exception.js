/**
 * Exception class
 * Represents errors that occur during application execution.
 */
Class('Exception', {
    '$extends': Error,
    'constructor': Exception,
    //we should define how our toString function works as this will be used internally
    //by the browser's stack trace generation function
    'toString': function () {
        return "[" + this.name + "] : " + this.message;
    }
});