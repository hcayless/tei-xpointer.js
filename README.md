# dll - Digital Latin Library Annotation Prototype

This repository contains a partially-functional mockup of an XML annotation service. It utilizes code from jQuery, Rangy, and TEI Boilerplate to enable the display of unmodified XML documents in the browser. The xpointer.js and annotate.js code handles the resolution of TEI Pointers within the documents.

## Prerequisites

You will need [Leiningen][1] 1.7.0 or above installed.

[1]: https://github.com/technomancy/leiningen

## Running

To start a web server for the application, run:

    lein ring server

## License

Copyright © 2013 Hugh Cayless and New York University. The use and distribution terms for this software are covered by the [http://opensource.org/licenses/eclipse-1.0.php](Eclipse Public License 1.0). By using this software in any fashion, you are agreeing to be bound by the terms of this license. You must not remove this notice, or any other, from this software.
