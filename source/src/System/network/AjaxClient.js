if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/17/2016.
     */
    Class('network.AjaxClient', {
        '$extends': 'System.network.BaseClient',
        '$static': {
            /**
             *  Returns the scheme for build an url.
             * */
            'getURLSchema': function (secure) {
                return (secure ? "https://" : "http://");
            }
        },
        'constructor': function (config) {
            this.$super(config.url, config.protocol);
            var self = this;

            var xhr = (function () {
                var userAgent = System.utils.UserAgent;
                if (userAgent.isIE() && userAgent.IE.getVersion() == 8 || userAgent.IE.getVersion() == 9) return new XDomainRequest();
                else if ($global.XMLHttpRequest) return new XMLHttpRequest();
                else return;
            })();

            try {
                xhr.open(config.method || "POST", this.url, true);
                self.trigger('open');
            } catch (e) {
                xhr = undefined;
            }

            // The browser doesn't support CORS
            if (!xhr) throw new System.exception.UnsupportedCORSException();

            xhr.timeout = config.timeout;

            if (config.responseType === 'binary') {
                // new browsers (XMLHttpRequest2-compliant)
                if ('responseType' in xhr) {
                    xhr.responseType = 'arraybuffer';
                }
                // old browsers (XMLHttpRequest-compliant)
                else if ('overrideMimeType' in xhr) {
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
            }

            xhr.onerror = function (e) {
                self.trigger('error', [e || new System.Exception("Unknown error.")]);
            };

            xhr.ontimeout = function () {
                self.trigger('error', [new System.exception.TimeoutException()]);
            }

            var notified = false;

            function notifyResponse(e) {
                if (!notified) {
                    if (!('response' in this)) {
                        try {
                            this.response = this.responseText;
                        } catch (e) {
                        }
                    }
                    self.trigger('message', [mixin(e, {'data': this.response})]);
                    notified = true;
                }
            }

            xhr.onreadystatechange = function readystatechange(e) {
                if (this.readyState == 4 && this.status == 200) {
                    notifyResponse.call(this, e);
                }
            }

            xhr.onload = function (e) {
                notifyResponse.call(this, e);
            }

            xhr.onabort = function (e) {
                self.trigger('close', [mixin(e, {'code': this.code, 'reason': this.reason})]);
            }

            this.agent = xhr;
        },
        'getReadyState': function () {
            return this.agent ? this.agent.readyState : 0;
        },
        'send': function (data) {
            try {
                if (this.agent) {
                    this.agent.send(data);
                    return;
                }
            } catch (e) {
            }
            throw new System.exception.InvalidStateException("Cannot perform send while the connection is not open.");
        },
        'close': function (code, reason) {
            try {
                if (this.agent) {
                    this.agent.code = code;
                    this.agent.reason = reason;
                    this.agent.abort();
                    return;
                }
            } catch (e) {
            }
            throw new System.exception.InvalidStateException("Cannot perform close while the connection is not open.");
        }
    });
}