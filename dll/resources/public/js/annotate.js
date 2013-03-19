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
  load: function(elt) {
    var selection = rangy.getSelection();
    var lemma = selection.toString();
    if (lemma.length > 0) {
      var line = jQuery(elt).parents("div[n]").attr("n");
      var comment;
      if (jQuery(elt).attr("n")) {
        comment = jQuery(elt).attr("n");
      } else {
        comment = jQuery(elt).parents("seg[n]").attr("n");
      }
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
      var xpointer = "match(//div[@n='"+line+"']//seg[@n='"+comment+"'],/" + lemma + "/";
      if (matches && matches.length > 0) {
        xpointer += "," + (matches.length + 1);
      }
      xpointer += ")";
      jQuery("p#xpointer").html('<a href="#' + xpointer + '">'+ lemma + '</a>');
    } else {
      var line = jQuery(elt).parents("[n]").attr("n");
      var comment = jQuery(elt).attr("n");
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
      var xpointer = "string-index(//div[@n='"+line+"']//seg[@n='"+comment+"'],"+offset+")";
      jQuery("p#xpointer").html('<a href="#' + xpointer + '"><i>insertion</i></a>');
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