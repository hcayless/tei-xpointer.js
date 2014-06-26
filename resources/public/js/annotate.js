/*
 *  Dependencies:   uuid.js from https://github.com/broofa/node-uuid
 *                  $
 *                  generator.js
 */

var OAContext = {
  "oa" :     "http://www.w3.org/ns/oa#",
  "cnt" :    "http://www.w3.org/2011/content#",
  "dc" :     "http://purl.org/dc/elements/1.1/",
  "dcterms": "http://purl.org/dc/terms/",
  "dctypes": "http://purl.org/dc/dcmitype/",
  "doap" :   "http://usefulinc.com/ns/doap#",
  "foaf" :   "http://xmlns.com/foaf/0.1/",
  "rdf" :    "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "rdfs" :   "http://www.w3.org/2000/01/rdf-schema#",
  "skos" :   "http://www.w3.org/2004/02/skos/core#",

  "hasBody" :         {"@type":"@id", "@id" : "oa:hasBody"},
  "hasTarget" :       {"@type":"@id", "@id" : "oa:hasTarget"},
  "hasSource" :       {"@type":"@id", "@id" : "oa:hasSource"},
  "hasSelector" :     {"@type":"@id", "@id" : "oa:hasSelector"},
  "hasState" :        {"@type":"@id", "@id" : "oa:hasState"},
  "hasScope" :        {"@type":"@id", "@id" : "oa:hasScope"},
  "annotatedBy" :  {"@type":"@id", "@id" : "oa:annotatedBy"},
  "serializedBy" : {"@type":"@id", "@id" : "oa:serializedBy"},
  "motivatedBy" :  {"@type":"@id", "@id" : "oa:motivatedBy"},
  "equivalentTo" : {"@type":"@id", "@id" : "oa:equivalentTo"},
  "styledBy" :     {"@type":"@id", "@id" : "oa:styledBy"},
  "cachedSource" : {"@type":"@id", "@id" : "oa:cachedSource"},
  "conformsTo" :   {"@type":"@id", "@id" : "dcterms:conformsTo"},
  "default" :      {"@type":"@id", "@id" : "oa:default"},
  "item" :         {"@type":"@id", "@id" : "oa:item"},
  "first":         {"@type":"@id", "@id" : "rdf:first"},
  "rest":          {"@type":"@id", "@id" : "rdf:rest", "@container" : "@list"},

  "chars" :        "cnt:chars",
  "bytes" :        "cnt:bytes",
  "format" :       "dc:format",
  "annotatedAt" :  "oa:annotatedAt",
  "serializedAt" : "oa:serializedAt",
  "when" :         "oa:when",
  "value" :        "rdf:value",
  "start" :        "oa:start",
  "end" :          "oa:end",
  "exact" :        "oa:exact",
  "prefix" :       "oa:prefix",
  "suffix" :       "oa:suffix",
  "label" :        "rdfs:label",
  "name" :         "foaf:name",
  "mbox" :         "foaf:mbox",
  "styleClass" :   "oa:styleClass",
  "version" :      "doap:version"
};

var Annotator = {
  version: null,
  create: function(body, xpointer, version, user, motivation) {
    var buffer = new Array(64);
    uuid.v1(null,buffer,0);
    uuid.v1(null,buffer,16);
    uuid.v1(null,buffer,32);
    uuid.v1(null,buffer,48);
    var annotation = {
      "@context": OAContext,
      "@id": (uuid.unparse(buffer, 0)),
      "@type": "oa:Annotation",
      "hasBody": {
        "@id": "urn:uuid:" + uuid.unparse(buffer, 16),
        "@type": ["cnt:ContentAsText", "dctypes:Text"],
        "chars": body
      },
      "hasTarget": {
        "@id": "urn:uuid:" + uuid.unparse(buffer, 32),
        "@type": "oa:SpecificResource",
        "hasSelector": {
          "@id": "urn:uuid:" + uuid.unparse(buffer, 48),
          "@type": "oa:FragmentSelector",
          "conformsTo": "http://www.tei-c.org/release/doc/tei-p5-doc/en/html/SA.html#SATS",
          "value": xpointer
        },
        "hasSource": {
          "@id": window.location.href,
          "@type": "dctypes:Text",
          "version" : version
        }
      },
      "annotatedBy": user,
      "motivatedBy": motivation
    };
    return annotation;
  }, 
  openWidget: function(user) {
    if (user != null) {
      var version;
      Annotator.closeWidget();
      $("body").append(
        '<div class="ann-widget">' +
          '<h3>Annotation <span class="close-widget"><img src="/annotator/images/loading-1.gif"></span></h3>' +
          '<form>' +
            '<input type="hidden" name="target" value="' + Generator.xpointer() + '" id="target">' +
            '<select name="motivation" id="motivation">' +
              '<option value="editing" selected>edit</option>' +
              '<option value="commenting">comment</option>' +
            '</select><br>' +
            '<textarea name="body" id="body"></textarea><br>' +
            '<input type="button" value="save" name="save">' +
          '</form>' +
        '</div>');
      if (!Annotator.version) {
        $.getJSON(window.location.pathname.replace("/annotate","/version"), function(data) {
          Annotator.version = data["sha"];
          $("input[name=save]").click({"version": Annotator.version, "user":user}, Annotator.save);
          $("span.close-widget").html("×").click(Annotator.closeWidget);
        });
      } else {
        $("input[name=save]").click({"version": Annotator.version, "user":user}, Annotator.save);
        $("span.close-widget").html("×").click(Annotator.closeWidget);
      }
    } else {
      alert("You must be logged in to annotate.");
    }
  },
  closeWidget: function() {
    $(".ann-widget").remove();
  },
  save: function(e) {
    $.post("/editor/text_notes/create", 
          Annotator.create($("#body").val(), $("#target").val(), 
            e.data["version"], e.data["user"], $("#motivation").val()),
          function(data, status, xhr) {
            Annotator.closeWidget();
          });
  }
    //set the target based on the current URL + xpointer
    //show a form for the user to fill in the body
    //set the body based on the form contents
    //generate an id based on the hash of the body + target
    //set the motivation thusly:
    //  if the "note" box is checked, oa:commenting
    //  otherwise, oa:editing -- we might subclass that as insertion or change, but in general
    //    an xpointer resolving to a point + a text body == an insertion, a sequence +
    //    an empty string body == a deletion, a sequence + a non-empty string body == a change

};
