if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/17/2016.
     */
    Class('network.WebSocketClient', {
        '$extends': 'System.network.BaseClient',
        '$static': {
            /**
             *  Returns the scheme for build an url.
             * */
            'getURLSchema': function (secure) {
                return (secure ? "wss://" : "ws://");
            }
        },
        'constructor': function (config) {
            this.$super(config.url, config.protocol);
            var self = this;
            if ("WebSocket" in $global) {
                try {
                    // Let us open a web socket
                    var connection = new WebSocket(this.url, this.protocol);

                    // Log errors
                    connection.onerror = function (e) {
                        self.trigger('error', [e || new System.Exception("Unknown error.")]);
                    }

                    // When the connection is open, send some data to the server
                    connection.onopen = function (e) {
                        self.trigger('open', [e]);
                    }

                    // Log messages from the server
                    connection.onmessage = function (e) {
                        self.trigger('message', [e]);
                    }

                    connection.onclose = function (e) {
                        // websocket is closed.
                        self.trigger('close', [apply(e, {'code': this.code, 'reason': this.reason})]);
                    }

                    this.agent = connection;
                } catch (e) {
                    self.trigger('error', [e || new System.Exception("Unknown error.")]);
                }
            } else {
                // The browser doesn't support WebSocket
                throw new System.exception.UnsupportedWebSocketException();
            }
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
                    this.agent.close(code, reason);
                    return;
                }
            } catch (e) {
                throw e || new System.exception.InvalidStateException("Cannot perform close while the connection is not open.");
            }
        }
    })
}