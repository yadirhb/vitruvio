/**
 * Created by yadirhb on 9/3/2016.
 */
Namespace('System.utils',
    /**
     * Class ExtensionExample
     */
    module.exports = Class('ExtensionExample', { // module.exports to publish the class over NodeJS
        'constructor': function (data) {
            this.data = data;
        },
        'getData': function () {
            return this.data;
        }
    })
)