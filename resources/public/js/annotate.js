rangy.config.checkSelectionRanges = false;
var Annotate = {
  select: function(range) {
    Annotate.clear();
    var sel = rangy.getSelection();
    sel.setSingleRange(range);
    if (sel.isCollapsed) {
      var rest = range.startContainer.splitText(range.startOffset);
      var span = document.createElement("ann");
      span.setAttribute("id", "cursor");
      var p = rest.parentNode;
      p.insertBefore(span,rest);
    }
  },
  clear: function() {
    jQuery("#cursor").remove();
  },
  findXPath: function(elt) {
    elt = jQuery(elt);
    if (elt[0].nodeType == Node.TEXT_NODE) {
      //look first for preceding sibling line breaks.
      var lb;
      try {
        lb = XPointer.getNode("preceding-sibling::lb[1]", elt);
        return Annotate.findXPath(lb);
      } catch (err) {
        return Annotate.findXPath(elt.parent()[0]);
      }
    }
    //simple case, there's an xml:id on the element
    if (!elt.attr("id").match(/^teibp-/)) {
      return [elt.attr("id"), elt];
    }
    /* Build a path array with as specific an XPath as we can manage. Look back and 
     * up the tree for lb, line, seg, p, ab, and div tags with @n, @type, or @xml:id
     * attributes. */
     var path = [];
    //see if current element has an @n attribute
    if (elt.attr("n")) {
      path.push(elt[0].localName+"[@n='"+jQuery(elt).attr("n")+"']");
    }
    var parents = elt.parentsUntil("TEI");
    // iterate up the tree until the <text> element
    for (var i = 0; i < parents.length; i++) {
      var curr = jQuery(parents[i]);
      // if we find an element with its own @xml:id, we're done
      if (!curr.attr("id").match(/^teibp-/)) {
        if (path[0]) {
          path.push("//"+curr[0].localName+"[@xml:id='"+curr.attr("id")+"']");
          return [path.reverse().join("//"),elt[0]];
        } else {
          return [curr.attr("id"),curr[0]];
        }
      } else if (curr.attr("n")) {
        if (!path[0]) {
          elt = curr;
        }
        path.push(curr[0].localName+"[@n='"+curr.attr("n")+"']");
      } else if (curr.attr("type")) {
        if (!path[0]) {
          elt = curr;
        }
        path.push(curr[0].localName+"[@type='"+curr.attr("type")+"']");
      }
    }
    // if the path now has at least one component, return it and the element
    if (path[0]) {
      return ["//" + path.reverse().join("//"),elt[0]];
    // we got nothin'. Build a nasty, big, literal XPath
    } else {
      xpath = "count(preceding-sibling::"+elt[0].localName+")";
      var count = document.evaluate(xpath, elt[0], null, XPathResult.NUMBER, null);
      path.push(elt[0].localName+"["+(count+1)+"]");
      for (var i = 0; i < parents.length - 1; i++) {
        xpath = "count(preceding-sibling::"+parents[i].localName+")";
        count = document.evaluate(xpath, parents[i], null, XPathResult.NUMBER, null);
        path.push(elt[0].localName+"["+(count+1)+"]");
      }
      return ["//"+path.reverse().join("/"),elt[0]];
    } 
  },
  load: function(elt) {
    var selection = rangy.getSelection();
    var lemma = selection.toString();
    var path;
    // figure out where to start: preceding <lb/> or nearest common container.
    if (selection.getRangeAt(0).startContainer == selection.getRangeAt(0).endContainer) {
      path = Annotate.findXPath(selection.getRangeAt(0).startContainer);
    } else {
      try {
        var lb = XPointer.getNode("preceding-sibling::lb[1]", selection.getRangeAt(0).startContainer);
        path = Annotate.findXPath(lb);
      } catch (err) {
        path = Annotate.findXPath(selection.getRangeAt(0).commonAncestorContainer);
      }
    }
    elt = path[1];
    path = path[0];
    if (lemma.length > 0) {
      var preceding = [];
      var anchorOffset = selection.anchorOffset;
      var children = jQuery(elt).contents();
      for (var i = 0; i < children.length; i++) {
        if (children[i] == selection.anchorNode || children[i] == selection.anchorNode.parentNode || children[i] == selection.anchorNode.parentNode.parentNode) break;
        preceding.push(children[i]);
      }
      for (var i = 0; i < preceding.length; i++) {
        var text = jQuery(preceding[i]).text();
        anchorOffset += text.length;
      }
      var focusOffset = selection.focusOffset;
      preceding = []
      for (var i = 0; i < children.length; i++) {
        if (children[i] == selection.focusNode || children[i] == selection.focusNode.parentNode || children[i] == selection.focusNode.parentNode.parentNode) break;
        preceding.push(children[i]);
      }
      for (var i = 0; i < preceding.length; i++) {
        var text = jQuery(preceding[i]).text();
        focusOffset += text.length;
      }
      var pos = anchorOffset > focusOffset?focusOffset:anchorOffset;
      var precedingText = jQuery(elt).text().substring(0,pos);
      var re = new RegExp(lemma, 'g');
      var matches = precedingText.match(re);
      var xpointer = "match("+path+",'" + lemma + "'";
      if (matches && matches.length > 0) {
        xpointer += "," + (matches.length + 1);
      }
      xpointer += ")";
      jQuery("p#xpointer").html('<a href="#' + xpointer + '">'+ lemma + '</a>');
    } else {
      var preceding = [];
      var offset = selection.anchorOffset;
      var children = jQuery(elt).contents();
      for (var i = 0; i < children.length; i++) {
        if (children[i] == selection.anchorNode || children[i] == selection.anchorNode.parentNode || children[i] == selection.anchorNode.parentNode.parentNode) break;
        preceding.push(children[i]);
      }
      for (var i = 0; i < preceding.length; i++) {
        var text = jQuery(preceding[i]).text();
        offset += text.length;
      }
      var xpointer = "string-index("+path+","+offset+")";
      jQuery("p#xpointer").html('<a href="#' + xpointer + '"><i>insertion</i></a>');
      Annotate.select(selection.getRangeAt(0));
    }
  }
}
jQuery(window).load(function() {
  if (window.location.hash) {
    var p = XPointer.parsePointer(window.location.hash);
    var range = XPointer.select(p);
    jQuery("html,body").scrollTop(jQuery(p.context).offset().top - 10);
    Annotate.select(range);
    Annotate.load(range.startContainer);
  }
});
jQuery(window).on("hashchange", function(e) {
  var p = XPointer.parsePointer(window.location.hash);
  var range = XPointer.select(p);
  jQuery("html,body").scrollTop(jQuery(p.context).offset().top - 10);
  Annotate.select(range);
  Annotate.load(range.startContainer);
});
jQuery("seg[type=comment]").mousedown(function(e) {
  Annotate.clear();
});
jQuery("seg[type=comment]").mouseup(function(e) {
  Annotate.load(this);
});