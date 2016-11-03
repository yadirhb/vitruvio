var Environment = Static.Class('Environment', {
    'isBrowser': isBrowser,
    'isDesktop': isDesktop,
    'isMobile': isMobile,
    'isNode': isNode,
    'getInfo': function () {
        return !this.prototype.info ? this.prototype.info = {
            'environment': this.getEnvironment(),
            'client': this.getClient()
        } : this.prototype.info;
    },
    'getPlatform': function () {
        if (!this.prototype.platform) {
            this.prototype.platform = this.isBrowser() ? 'browser' : this.isNode() ? 'desktop' : undefined;
        }
        return this.prototype.platform;
    },
    'getEnvironment': function () {
        if (!this.prototype.env) {
            if (this.isBrowser()) {
                this.prototype.env = 'browser';
            } else if (this.isDesktop()) {
                this.prototype.env = 'desktop';
            } else if (this.isMobile()) {
                this.prototype.env = 'mobile';
            }
        }
        return this.prototype.env;
    },
    'getClient': function () {
        if (!this.prototype.client) {
            if (this.isBrowser()) {
                var userAgent = System.utils.UserAgent;
                if (userAgent.isChrome()) this.prototype.client = "chrome";
                else if (userAgent.isFirefox()) this.prototype.client = "firefox";
                else if (userAgent.isSafari()) this.prototype.client = "safari";
                else if (userAgent.isOpera()) this.prototype.client = "opera";
                else if (userAgent.isIE()) this.prototype.client = "ie";
                else if (userAgent.isEdge()) this.prototype.client = "edge";
                else if (userAgent.isBlink()) this.prototype.client = "blink";
            } else if (this.isNode()) {
                this.prototype.client = "node";
            }
        }

        return this.prototype.client;
    }
});