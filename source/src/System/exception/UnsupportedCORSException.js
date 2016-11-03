if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/17/2016.
     */
    Class('exception.UnsupportedCORSException', {
        '$extends': 'System.Exception',
        'constructor': function (message) {
            this.$super(message || "Your browser doesn't support CORS connections.");
        }
    })
}