rangy.config.checkSelectionRanges = false;
/**
 *  The XPointer Generator has methods for creating a TEI XPointer from a selection
 *  on the page.
 */
var Generator = {
  /* Given a Rangy range, select the relevant text on the page or insert a "cursor". */
  select: function(range) {
    Generator.clear();
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
  /* Tests whether the current document uses <lb/> tags.
   */
  linebreaks: function(elt) {
    var lb = document.evaluate("ancestor::div[@type='edition']//lb", elt, null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
    return lb.singleNodeValue?true:false;
  },
  contains: function(elt1, elt2) {
    var ancestors = document.evaluate("ancestor::*",elt2,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);
    var elt;
    while (elt = ancestors.iterateNext()) {
      if (elt1 == elt) return true;
    }
    return false;
  },
  gatherText: function(curr, anchor) {
    var preceding = [];
    if (Generator.contains(curr, anchor)) {
      return Generator.gatherText(curr.firstChild, anchor);
    }
    while (curr != anchor) {
      if (curr.nodeType == Node.TEXT_NODE && curr != anchor) {
        preceding.push(curr.valueOf());
      } else if (curr.localName != "lb") {
        var desc = document.evaluate("descendant-or-self::node()",curr,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);
        var item;
        while (item = desc.iterateNext()) {
          if (item.nodeType == Node.TEXT_NODE && item != anchor) {
            preceding.push(item.valueOf());
          }
          if (item == anchor) {
            curr = anchor;
            break;
          }
        }
      }
      if (curr != anchor) {
        if (curr.nextSibling != null) {
          curr = curr.nextSibling;
        } else {
          var n = document.evaluate("following::node()",curr,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
          curr = n.singleNodeValue;
        }
      } 
      if (curr == null) break;
    }
    return preceding;
  },
  /**
   *  Given an element as input, tries to construct an XPath expression that uniquely
   *  identifies that element. This works best if your document has good structural
   *  labels. The function looks for elements with label (@n), @type, and @xml:id attributes.
   */
  findXPath: function(elt) {
    elt = jQuery(elt);
    if (elt[0].nodeType == Node.TEXT_NODE) {
      if(Generator.linebreaks(elt[0])) {
        //look next for preceding line breaks in the same container with an @id or @n.
        var lb = document.evaluate("preceding::lb[1]",elt[0],null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
        lb = lb.singleNodeValue;
        if (lb != null) {
          var lbp,eltp;
          lbp = document.evaluate("ancestor::*[not(starts-with(@id, 'teibp-')) or @n][1]",lb,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
          lbp = lbp.singleNodeValue;
          eltp = document.evaluate("ancestor::*[not(starts-with(@id, 'teibp-')) or @n][1]",elt[0],null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
          eltp = eltp.singleNodeValue;
          if (lbp == eltp) {
            return Generator.findXPath(lb);
          }
        }
      }
      return Generator.findXPath(elt.parent()[0]);
    }
    //simple case, there's an xml:id on the element—Boilerplate prefixes all ids it creates with teibp, so ignore those
    if (!/^teibp-/.test(elt.attr("id"))) {
      return [elt.attr("id"), elt[0]];
    }
    /* Build a path array with as specific an XPath as we can manage. Look back and
     * up the tree for lb, line, seg, p, ab, and div tags with @n, @type, or @xml:id
     * attributes. */
     var path = [];
    //see if current element has an @n attribute
    if (elt.attr("n")) {
      path.push(elt.data("teiform")+"[@n='"+jQuery(elt).attr("n")+"']");
    }
    var parents = elt.parentsUntil("TEI");
    var curr;
    var resultelt = elt;
    // iterate up the tree until the <text> element
    for (var i = 0; i < parents.length; i++) {
      var curr = jQuery(parents[i]);
      // if we find an element with its own @xml:id, we're done
      if (!/^teibp-/.test(curr.attr("id"))) {
        if (path[0]) {
          path.push("//"+curr.data("teiform")+"[@xml:id='"+curr.attr("id")+"']");
          return [path.reverse().join("//"),resultelt[0]];
        } else {
          return [curr.attr("id"),curr[0]];
        }
      } else if (curr.attr("n")) {
        if (!path[0]) {
          resultelt = curr;
        }
        path.push(curr.data("teiform")+"[@n='"+curr.attr("n")+"']");
      } else if (curr.attr("type")) {
        if (!path[0]) {
          resultelt = curr;
        }
        path.push(curr.data("teiform")+"[@type='"+curr.attr("type")+"']");
      }
    }
    // If the path now has at least one component, return it and the element
    // But first, check that the path finds only one element
    if (path[0]) {
      var xpath = "//" + path.reverse().join("//");
      var xpr = document.evaluate(xpath,document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
      if (xpr.snapshotLength == 1) {
        return ["//" + path.join("//"),resultelt[0]];
      }
    }
    // we got nothin'. Build a nasty, big, literal XPath
    path = [];
    xpath = "count(preceding-sibling::"+elt[0].localName+")";
    var count = document.evaluate(xpath, elt[0], null, XPathResult.NUMBER, null).numberValue;
    path.push(elt.data("teiform")+"["+(count+1)+"]");
    for (var i = 0; i < parents.length - 1; i++) {
      xpath = "count(preceding-sibling::"+parents[i].localName+")";
      count = document.evaluate(xpath, parents[i], null, XPathResult.NUMBER, null).numberValue;
      path.push(jQuery(parents[i]).data("teiform")+"["+(count+1)+"]");
    }
    return ["//"+path.reverse().join("/"),elt[0]];
  },
  generate_range: function(selection, context, contextPath) {

  },
  generate_match: function(selection, context, contextPath) {
    var lemma = selection.toString()
      .replace(/\\/g, '\\')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\?/g, '\\?')
      .replace(/\*/g, '\\*')
      .replace(/\+/g, '\\+');
    var preceding = [];
    var anchorOffset = selection.anchorOffset;
    var children = jQuery(context).contents();
    if (children.length == 0) {
      var anchor = selection.anchorNode;
      var curr = context;
      preceding = Generator.gatherText(curr, anchor);
    }
    for (var i = 0; i < children.length; i++) {
      if (children[i] == selection.anchorNode || Generator.contains(children[i], selection.anchorNode)) break;
      preceding.push(children[i]);
    }
    for (var i = 0; i < preceding.length; i++) {
      if (typeof preceding[i] == "string") {
        anchorOffset += preceding[i].length;
      } else {
        var text = jQuery(preceding[i]).text();
        anchorOffset += text.length;
      }
    }
    var focusOffset = selection.focusOffset;
    if (selection.anchorNode != selection.focusNode) {
      preceding = []
      for (var i = 0; i < children.length; i++) {
        if (children[i] == selection.focusNode || children[i] == selection.focusNode.parentNode || children[i] == selection.focusNode.parentNode.parentNode) break;
        preceding.push(children[i]);
      }
      for (var i = 0; i < preceding.length; i++) {
        if (typeof preceding[i] == "string") {
          focusOffset += preceding[i].length;
        } else {
          var text = jQuery(preceding[i]).text();
          focusOffset += text.length;
        }
      }
    } else {
      focusOffset = (focusOffset - selection.anchorOffset) + anchorOffset;
    }
    var pos = anchorOffset > focusOffset?focusOffset:anchorOffset;
    var precedingText;
    if (children.length > 0) {
      precedingText = jQuery(context).text().substring(0,pos);
    } else {
      precedingText = preceding.join("");
      precedingText += selection.anchorNode.nodeValue.substring(0,pos);
    }
    var re = new RegExp(lemma, 'g');
    var matches = precedingText.match(re);
    var xpointer = "match("+contextPath+",'" + lemma.replace(/\s+/g, '\\s+').replace(/'/g, "\\'") + "'";
    if (matches && matches.length > 0) {
      xpointer += "," + (matches.length + 1);
    }
    xpointer += ")";
    return xpointer;
  },
  generate_string_index: function(selection, context, contextPath) {
    var preceding = [];
    var offset = selection.anchorOffset;
    var anchor = selection.getRangeAt(0).startContainer;
    var children = jQuery(context).contents();
    //if (children.length == 0) { //we're at an <lb/> or other empty element
      if (context == anchor.nextSibling) { // We've hit the edge case in webkit where the selection is at 0.
        return "string-index("+contextPath+",0)";
      }
      var curr = context;
      preceding = Generator.gatherText(curr, anchor);
    //} 
    for (var i = 0; i < preceding.length; i++) {
      var text = jQuery(preceding[i]).text();
      offset += text.length;
    }
    return "string-index("+contextPath+","+offset+")";
  },
  /**
   *  Generates an XPointer for the selected text.
   */
  xpointer: function(element) {
    var selection = rangy.getSelection();
    var lemma = selection.toString();
    var path;
    // figure out the context node for the pointer: preceding <lb/> or nearest common container.
    if (element) {
      path = Generator.findXPath(element);
    } else {
      if (selection.getRangeAt(0).startContainer == selection.getRangeAt(0).endContainer) {
        path = Generator.findXPath(selection.getRangeAt(0).startContainer);
      } else {
        if (!Generator.linebreaks(selection.getRangeAt(0).startContainer)) {
          path = Generator.findXPath(selection.getRangeAt(0).commonAncestorContainer);
        } else {
          var lb = document.evaluate("preceding::lb[1]",selection.getRangeAt(0).startContainer,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
          path = Generator.findXPath(lb.singleNodeValue);
        }
      }
    }
    elt = path[1];
    path = path[0];
    // figure out the position relative to the context node of the lemma (if we're building a match),
    // or the string-index if we're dealing with a point.
    if (lemma.length > 0) { // we're not dealing with a point
      return Generator.generate_match(selection, elt, path);
    } else {
      return Generator.generate_string_index(selection, elt, path);
    }
  }
};
