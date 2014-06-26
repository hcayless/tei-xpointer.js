/**
 *  Dependencies:   jQuery
 *                  xpointer.js
 *                  generator.js
 *                  annotate.js
 */

//Query and set up user URI
var user;
$.getJSON(window.location.origin + "/editor/user/info", function(data) {
  if (data.user["name"]) {
    user = window.location.origin + "/editor/users/" + encodeURIComponent(data.user["name"]);
  }
});

jQuery(window).load(function() {
  if (window.location.hash) {
    var p = XPointer.parsePointer(window.location.hash);
    var range = XPointer.resolve(p);
    jQuery("html,body").scrollTop(jQuery(p.context).offset().top - 10);
    Generator.select(range);
    jQuery("#xpointer").text(window.location.hash.replace(/^#/,""));
    jQuery("p#xpointerlink").html("&lt;a href=\"" + window.location.href.replace(/#.*$/,"") + window.location.hash + "\">xpointer link&lt;/a>");
  }
});
jQuery(window).on("hashchange", function(e) {
  var p = XPointer.parsePointer(window.location.hash);
  var range = XPointer.resolve(p);
  jQuery("html,body").scrollTop(jQuery(p.context).offset().top - 10);
  Generator.select(range);
 });
jQuery("text").click(function(e) {
  Generator.clear();
  var xpointer = Generator.xpointer();
  Generator.select(XPointer.resolve(XPointer.parsePointer(xpointer)));
  Annotator.openWidget(user);
});
jQuery("lb").click(function(e) {
  Generator.clear();
  var xpointer = Generator.xpointer(e.currentTarget);
  Generator.select(XPointer.resolve(XPointer.parsePointer(xpointer)));
  Annotator.openWidget(user);
});

//Pad gaps appropriately
var pad = function(n, val) {
  var result = "";
  for(var i=0; i < n; i++) {
    result += val;
  }
  return result;
}
//Is space all that separates elt1 and elt2?
var noTextBetween = function(elt1, elt2) {
  var b = document.evaluate("following::node()",elt1,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);
  var between = "";
  var n;
  while ((n = b.iterateNext()) && n != elt2) {
    if (n.nodeType == Node.TEXT_NODE) {
      between += n.valueOf();
    }
  }
  return between.replace(/ */g, "").length > 0;
}

/******************************
 * Illegible Characters       *
 ******************************/
/*
 * <gap reason="lost" quantity="?" unit="character"/>
 */
jQuery("gap[reason=illegible][unit=character][quantity]").each(function(i,e) {
  var gap = jQuery(e);
  gap.attr("data-content", pad(gap.attr("quantity")," ̣"));
});
/******************************
 * Characters lost            *
 ******************************/

/*
 * <gap reason="lost" quantity="?" unit="character"/>
 */
jQuery("gap[reason=lost][unit=character][quantity]").each(function(i,e) {
  var gap = jQuery(e);
  gap.attr("data-content", pad(gap.attr("quantity")," ̣"));
});

/*
 * <supplied reason="lost">
 */

// Adjacent supplieds, like [foo] [bar] should be combined, thus: [foo bar], so 
// we have to check for text between supplieds.
// TODO: needs doing with gaps too
var supplieds = jQuery("supplied[reason=lost]");
jQuery("supplied[reason=lost]").each(function(i,e) {
  var suppl = jQuery(e);
  var after = "";
  if (i == 0 || noTextBetween(supplieds[i-1], e)) {
    suppl.attr("data-content-before", "[");
  }
  if (suppl.attr("cert") == "low") {
    after = "?";
  }
  if (i == (supplieds.length - 1) || noTextBetween(e, supplieds[i+1])) {
    suppl.attr("data-content-after", after + "]");
  }
});

/******************************
 * Lines lost                 *
 ******************************/

/*
 * <gap reason="lost" quantity="?" unit="line"/>
 */
jQuery("gap[reason=lost][unit=line][quantity]").each(function(i,e) {
  var gap = jQuery(e);
  gap.attr("data-content", "ca. " + gap.attr("quantity") + " line" + (gap.attr("quantity") > 1?"s":""));
});


/******************************
 * Line numbering             *
 ******************************/

jQuery("lb[n]").each(function(i,e) {
  var l = jQuery(e);
  if (l.attr("n") % 5 == 0) {
    l.attr("data-n", l.attr("n"));
  }
});

jQuery("l[n]").each(function(i,e) {
  var l = jQuery(e);
  if (l.attr("n") % 5 == 0) {
    l.before('<span style="float:left;margin-left:-2em;display:inline;" data-n="'+l.attr("n")+'"></span>');
  }
});

/******************************
 * Activate refs              *
 ******************************/
jQuery("ref[target]").hover(function(ev) {
  var ref = jQuery(ev.currentTarget);
  var app = jQuery(ref.attr("target"));
  ref.after('<span id="app-' + ref.attr("id") 
    + '" style="position:absolute;top:' + (ref.position().top - 8) + 'px;left:' 
    + (jQuery("div[type=edition]").width() + 20) 
    + 'px;padding:5px;border:thin solid gray;"><listApp><app>' + app.html() 
    + '</app></listApp></span>');
}, function(ev) {
  jQuery("#app-" + jQuery(ev.currentTarget).attr("id")).remove();
});

jQuery(window).load(function() {
  if (window.location.hash) {
    var p = XPointer.parsePointer(window.location.hash);
    var range = XPointer.resolve(p);
    jQuery("html,body").scrollTop(jQuery(p.context).offset().top - 10);
    Generator.select(range);
    jQuery("#xpointer").text(window.location.hash.replace(/^#/,""));
    jQuery("p#xpointerlink").html("&lt;a href=\"" + window.location.href.replace(/#.*$/,"") + window.location.hash + "\">xpointer link</a>");
  }
});
jQuery(window).on("hashchange", function(e) {
  var p = XPointer.parsePointer(window.location.hash);
  var range = XPointer.resolve(p);
  jQuery("html,body").scrollTop(jQuery(p.context).offset().top - 10);
  Generator.select(range);
  jQuery("#xpointer").text(window.location.hash);
  jQuery("p#xpointerlink").html("&lt;a href=\"" + window.location.href.replace(/#.*$/,"") + window.location.hash + "\">xpointer link</a>");
});
jQuery("text").mousedown(function(e) {
  Generator.clear();
});
jQuery("text").mouseup(function(e) {
  var xpointer = Generator.xpointer();
  jQuery("#xpointer").text(xpointer);
  jQuery("p#xpointerlink").html("<a href=\"" + window.location.href.replace(/#.*$/,"") + "#" + xpointer + "\">xpointer link</a>");
  Generator.select(XPointer.resolve(XPointer.parsePointer(xpointer)));
});
