if (Environment.isBrowser()) {
    /**
     * Created by yadirhb on 2/19/2016.
     */
    Static.Class('runtime.serialization.xml.XMLParser', {
        'stringToXML': function (sValue) {
            try {
                var xmlDoc;
                if ($global.DOMParser) {
                    xmlDoc = (new DOMParser()).parseFromString(sValue, "text/xml");
                }
                else {
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = "false";
                    xmlDoc.loadXML(sValue);
                }
                return xmlDoc;
            } catch (e) {
                throw new System.exception.XMLException("Unable to parse source string to xml object.");
            }
        }
    })
}