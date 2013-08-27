# tei-xpointer.js - TEI Pointer Library

This repository contains an implementation of the [draft proposal](https://github.com/hcayless/TEI_Pointers_Draft) 
for new TEI XPointers. It utilizes code from jQuery, [Rangy](https://code.google.com/p/rangy/), and 
[TEI Boilerplate](http://dcl.slis.indiana.edu/teibp/) to enable the display of unmodified XML documents in the 
browser. The xpointer.js and annotate.js code handles the resolution of TEI Pointers within the documents. There is a
demo running at <http://tei.philomousos.com/>. Note: the demo is a demo, there are certainly bugs, the webapp part may 
be subject to falling over under any load at all, etc.

## Prerequisites

You will need [Leiningen][1] 1.7.0 or above installed to run the document loading application, which reads TEI P5 XML files either locally or from the web and delivers them to the browser with the TEI Boilerplate XSLT processing inscruction added.

[1]: https://github.com/technomancy/leiningen

## Running the app

To start a web server for the application, run:

    lein ring server-headless
    
Go to http://localhost:3000 to see an example text. Any TEI P5 text on the web can be loaded using the widget on the right in the text view. Do note that TEI Boilerplate doesn't cope well with absolutely every TEI construct, particularly when there is no standard display for a given element.

## License

Copyright © 2013 Hugh Cayless. The use and distribution terms for this software are covered by the [Eclipse Public License 1.0](http://opensource.org/licenses/eclipse-1.0.php). By using this software in any fashion, you are agreeing to be bound by the terms of this license. You must not remove this notice, or any other, from this software.
