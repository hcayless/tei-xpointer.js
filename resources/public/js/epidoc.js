//Pad gaps appropriately
var pad = function(n, val) {
  var result = "";
  for(var i=0; i < n; i++) {
    result += val;
  }
  return result;
}
jQuery("gap[unit='character']").each(function(i,e) {
  var gap = jQuery(e);
  gap.attr("data-content", pad(gap.attr("quantity")," ̣"));
});