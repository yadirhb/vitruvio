/**
 * This class wraps the global.console object to give support older Browsers.
 */
Static.Class('utils.Log', {
    '$extends' : 'System.utils.Assert',
    'debug': function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.debug ) {
                $global.console.debug(arguments[0]);
            }
        }
    },
    'info': function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.info) {
                $global.console.info(arguments[0]);
            }
        }
    },
    'log' : function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.log) {
                $global.console.log(arguments[0]);
            }
        }
    },
    'error' : function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.error) {
                $global.console.error(arguments[0]);
            }
        }
    },
    'warn' : function(){
        if(CONFIG.DEBUG === true) {
            if($global.console && $global.console.warn) {
                $global.console.warn(arguments[0]);
            }
        }
    },
    'assert' : function(){
        if(CONFIG.DEBUG === true) {
            this.$superclass.assert.apply(this, arguments);
        }
    },
    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    'makeError' : function(id, msg, err, requireModules) {
        var e = new System.Exception(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.innerException = err;
        }
        return e;
    }
});