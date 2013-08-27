<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:eg="http://www.tei-c.org/ns/Examples"
	xmlns:tei="http://www.tei-c.org/ns/1.0" 
	xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" 
	xmlns:exsl="http://exslt.org/common"
	xmlns:msxsl="urn:schemas-microsoft-com:xslt"
	xmlns:fn="http://www.w3.org/2005/xpath-functions"
	extension-element-prefixes="exsl msxsl"
	exclude-result-prefixes="xsl tei xd eg fn #default">
	<xd:doc  scope="stylesheet">
		<xd:desc>
			<xd:p><xd:b>Created on:</xd:b> Nov 17, 2011</xd:p>
			<xd:p><xd:b>Author:</xd:b> John A. Walsh</xd:p>
			<xd:p>TEI Boilerplate stylesheet: Copies TEI document, with a very few modifications
				into an html shell, which provides access to javascript and other features from the
				html/browser environment.</xd:p>
		</xd:desc>
	</xd:doc>
	<xsl:include href="xml-to-string.xsl"/>

	<xsl:output encoding="UTF-8" method="html" omit-xml-declaration="yes"/>
	
	<xsl:param name="teibpHome" select="'http://dcl.slis.indiana.edu/teibp/'"/>
	<xsl:param name="inlineCSS" select="false()"/>
	<xsl:param name="includeToolbox" select="true()"/>
	<xsl:param name="includeAnalytics" select="true()"/>
	
	<!-- parameters for file paths or URLs -->
	<!-- modify filePrefix to point to files on your own server, 
		or to specify a relative path, e.g.:
		<xsl:param name="filePrefix" select="'http://dcl.slis.indiana.edu/teibp'"/>
		
	-->
	<xsl:param name="filePrefix" select="''"/>
	
	<xsl:param name="teibpCSS" select="concat($filePrefix,'/css/teibp.css')"/>
	<xsl:param name="customCSS" select="concat($filePrefix,'/css/custom.css')"/>
	<xsl:param name="jqueryJS" select="concat($filePrefix,'/js/jquery/jquery-1.9.1.js')"/>
	<xsl:param name="jqueryBlockUIJS" select="concat($filePrefix,'/js/jquery/plugins/jquery.blockUI.js')"/>
  <xsl:param name="rangycore" select="concat($filePrefix, '/js/rangy/rangy-core.js')"/>
  <xsl:param name="rangyCSS" select="concat($filePrefix, '/js/rangy/rangy-cssclassapplier.js')"/>
	<xsl:param name="teibpJS" select="concat($filePrefix,'/js/teibp.js')"/>
	<xsl:param name="theme.default" select="concat($filePrefix,'/css/teibp.css')"/>
	<xsl:param name="theme.sleepytime" select="concat($filePrefix,'/css/sleepy.css')"/>
	<xsl:param name="theme.terminal" select="concat($filePrefix,'/css/terminal.css')"/>
	
	

	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Match document root and create and html5 wrapper for the TEI document, which is
				copied, with some modification, into the HTML document.</xd:p>
		</xd:desc>
	</xd:doc>

	<xsl:key name="ids" match="//*" use="@xml:id"/>

	<xsl:template match="/" name="htmlShell" priority="99">
		<html>
			<xsl:call-template name="htmlHead"/>
			<body>
				<xsl:if test="$includeToolbox = true()">
					<xsl:call-template name="teibpToolbox"/>
				</xsl:if>
				<div id="tei_wrapper">
					<xsl:apply-templates/>
				</div>
			  <script type="text/javascript" src="/js/xpointer.js"/>
        <script type="text/javascript" src="/js/annotate.js"/>
        <script type="text/javascript" src="/js/epidoc.js"/>
        <script type="text/javascript">
          jQuery(window).load(function() {
            if (window.location.hash) {
              var p = XPointer.parsePointer(window.location.hash);
              var range = XPointer.select(p);
              jQuery("html,body").scrollTop(jQuery(p.context).offset().top - 10);
              Annotate.select(range);
              jQuery("#xpointer").text(window.location.hash.replace(/^#/,""));
              jQuery("p#xpointerlink").html("&lt;a href=\"" + window.location.href.replace(/#.*$/,"") + window.location.hash + "\">xpointer link&lt;/a>");
            }
          });
          jQuery(window).on("hashchange", function(e) {
            var p = XPointer.parsePointer(window.location.hash);
            var range = XPointer.select(p);
            jQuery("html,body").scrollTop(jQuery(p.context).offset().top - 10);
            Annotate.select(range);
            jQuery("#xpointer").text(window.location.hash);
            jQuery("p#xpointerlink").html("&lt;a href=\"" + window.location.href.replace(/#.*$/,"") + window.location.hash + "\">xpointer link&lt;/a>");
          });
          jQuery("text").mousedown(function(e) {
            Annotate.clear();
          });
          jQuery("text").mouseup(function(e) {
            var xpointer = Annotate.xpointer();
            jQuery("#xpointer").text(Annotate.xpointer().replace(/(,|\/+|\+)/g,"$1&#x200b;"));
            jQuery("p#xpointerlink").html("&lt;a href=\"" + window.location.href.replace(/#.*$/,"") + "#" + Annotate.xpointer() + "\">xpointer link&lt;/a>");
            Annotate.select(XPointer.select(XPointer.parsePointer(xpointer)));
          });
        </script>
			</body>
		</html>
	</xsl:template>
	
	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Basic copy template, copies all nodes from source XML tree to output
				document.</xd:p>
		</xd:desc>
	</xd:doc>
	
	<xsl:template match="@*">
		<!-- copy select elements -->
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Template for elements, which adds an @xml:id to every element. Existing @xml:id
				attributes are retained unchanged.</xd:p>
		</xd:desc>
	</xd:doc>

	<xsl:template match="*"> 
		<xsl:element name="{local-name()}">
			<xsl:call-template name="addID"/>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:element>
	</xsl:template>

	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Template to omit processing instructions from output.</xd:p>
		</xd:desc>
	</xd:doc>
	<xsl:template match="processing-instruction()" priority="10"/>

	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Template moves value of @rend into an html @style attribute. Stylesheet assumes
				CSS is used in @rend to describe renditions, i.e., styles.</xd:p>
		</xd:desc>
	</xd:doc>
	<xsl:template match="@rend">
		<xsl:choose>
			<xsl:when test="$inlineCSS = true()">
				<xsl:attribute name="style">
					<xsl:value-of select="."/>
				</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:copy>
					<xsl:apply-templates select="@*|node()"/>
				</xsl:copy>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template name="rendition">
		<xsl:if test="@rendition">
			<xsl:attribute name="rendition">
				<xsl:value-of select="@rendition"/>
			</xsl:attribute>
		</xsl:if>
	</xsl:template>
	
	

	<xsl:template match="@xml:id">
		<!-- @xml:id is copied to @id, which browsers can use
			for internal links.
		-->
		<!--
		<xsl:attribute name="xml:id">
			<xsl:value-of select="."/>
		</xsl:attribute>
		-->
		<xsl:attribute name="id">
			<xsl:value-of select="."/>
		</xsl:attribute>
	</xsl:template>

	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Transforms TEI ref element to html a (link) element.</xd:p>
		</xd:desc>
	</xd:doc>
	<xsl:template match="tei:ref[@target]" priority="99">
		<a href="{@target}">
			<xsl:call-template name="rendition"/>
			<xsl:apply-templates/>
		</a>
	</xsl:template>

	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Transforms TEI ptr element to html a (link) element.</xd:p>
		</xd:desc>
	</xd:doc>
	<xsl:template match="tei:ptr[@target]" priority="99">
		<a href="{@target}">
			<xsl:call-template name="rendition"/>
			<xsl:value-of select="normalize-space(@target)"/>
		</a>
	</xsl:template>


	<!-- need something else for images with captions -->
	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Transforms TEI figure element to html img element.</xd:p>
		</xd:desc>
	</xd:doc>
	<xsl:template match="tei:figure[tei:graphic[@url]]" priority="99">
		<xsl:copy>
			<xsl:apply-templates select="@*"/>
			<xsl:call-template name="addID"/>
			<img alt="{normalize-space(tei:figDesc)}" src="{tei:graphic/@url}"/>
			<xsl:apply-templates select="*[local-name() != 'graphic' and local-name() != 'figDesc']"/>
		</xsl:copy>
	</xsl:template>

	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Adds some javascript just before end of root tei element. Javascript sets the
				/html/head/title element to an appropriate title selected from the TEI document.
				This could also be achieved through XSLT but is here to demonstrate some simple
				javascript, using JQuery, to manipulate the DOM containing both html and TEI.</xd:p>
		</xd:desc>
	</xd:doc>
	<xsl:template match="tei:TEI" priority="99">
		<xsl:element name="{local-name()}">
			<xsl:call-template name="addID"/>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:element>
	</xsl:template>
  
  <xsl:template match="tei:title">
    <title><xsl:value-of select="."/></title>
  </xsl:template>
	
	<xsl:template name="addID">
		<xsl:if test="not(@xml:id) and not(ancestor::eg:egXML)">
			<xsl:attribute name="id">
				<xsl:call-template name="generate-unique-id">
					<xsl:with-param name="root" select="concat('teibp-',generate-id())"/>
				</xsl:call-template>
			</xsl:attribute>
		</xsl:if>
	</xsl:template>

	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>The generate-id() function does not guarantee the generated id will not conflict
				with existing ids in the document. This template checks for conflicts and appends a
				number (hexedecimal 'f') to the id. The template is recursive and continues until no
				conflict is found</xd:p>
		</xd:desc>
		<xd:param name="root">The root, or base, id used to check for conflicts</xd:param>
		<xd:param name="suffix">The suffix added to the root id if a conflict is
			detected.</xd:param>
	</xd:doc>
	<xsl:template name="generate-unique-id">
		<xsl:param name="root"/>
		<xsl:param name="suffix"/>
		<xsl:variable name="id" select="concat($root,$suffix)"/>
		<xsl:choose>
			<xsl:when test="key('ids',$id)">
				<!--
				<xsl:message>
					<xsl:value-of select="concat('Found duplicate id: ',$id)"/>
				</xsl:message>
				-->
				<xsl:call-template name="generate-unique-id">
					<xsl:with-param name="root" select="$root"/>
					<xsl:with-param name="suffix" select="concat($suffix,'f')"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$id"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Template for adding /html/head content.</xd:p>
		</xd:desc>
	</xd:doc>
	<xsl:template name="htmlHead">
		<head>
			<meta charset="UTF-8"/>

			<link id="maincss" rel="stylesheet" type="text/css" href="{$teibpCSS}"/>
			<link rel="stylesheet" type="text/css" href="{$customCSS}"/>
			<script type="text/javascript" src="{$jqueryJS}"/>
			<script type="text/javascript" src="{$jqueryBlockUIJS}"/>
      <script type="text/javascript" src="{$rangycore}"/>
      <script type="text/javascript" src="{$rangyCSS}"/>
			<script type="text/javascript" src="{$teibpJS}"/>
			
			<script type="text/javascript">
				$(document).ready(function() {
					$("html > head > title").text($("TEI > teiHeader > fileDesc > titleStmt > title:first").text());
					$.unblockUI();				
				});
			</script>
			<xsl:call-template name="rendition2style"/>
			<title><!-- don't leave empty. --></title>
			<xsl:if test="$includeAnalytics = true()">
				<xsl:call-template name="analytics"/>
			</xsl:if>
		</head>
	</xsl:template>

	<xsl:template name="rendition2style">
		<style type="text/css">
            <xsl:apply-templates select="//tei:rendition" mode="rendition2style"/>
        </style>
	</xsl:template>
	
	<xsl:template match="tei:rendition[@xml:id and @scheme = 'css']" mode="rendition2style">
		<xsl:value-of select="concat('[rendition~=&quot;#',@xml:id,'&quot;]')"/>
		<xsl:if test="@scope">
			<xsl:value-of select="concat(':',@scope)"/>
		</xsl:if>
		<xsl:value-of select="concat('{ ',normalize-space(.),'}&#x000A;')"/>
	</xsl:template>
	
	<xsl:template match="tei:rendition[not(@xml:id) and @scheme = 'css' and @corresp]" mode="rendition2style">
		<xsl:value-of select="concat('[rendition~=&quot;#',substring-after(@corresp,'#'),'&quot;]')"/>
		<xsl:if test="@scope">
			<xsl:value-of select="concat(':',@scope)"/>
		</xsl:if>
		<xsl:value-of select="concat('{ ',normalize-space(.),'}&#x000A;')"/>
	</xsl:template>
	<xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl">
		<xd:desc>
			<xd:p>Template for adding footer to html document.</xd:p>
		</xd:desc>
	</xd:doc>
	<xsl:variable name="htmlFooter">
		<div id="footer"> Powered by <a href="{$teibpHome}">TEI Boilerplate</a>. TEI Boilerplate is licensed under a <a
				href="http://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0
				Unported License</a>. <a href="http://creativecommons.org/licenses/by/3.0/"><img
					alt="Creative Commons License" style="border-width:0;"
					src="http://i.creativecommons.org/l/by/3.0/80x15.png"/></a>
		</div>
	</xsl:variable>

	<xsl:template name="teibpToolbox">
    <div id="sidebar"><form action="/proxy" method="get" accept-charset="utf-8">
      <h2>TEI XPointer Tool</h2>
      <p>Click on any point in the text, double click to select a word, or click and drag to select text. A TEI Pointer will be created that can reference your selection, even across element boundaries.</p>
      <p id="xpointer"></p>
      <p id="xpointerlink"></p>
      <h4>Paste in the URL of a TEI P5 document to load it:</h4>
      <p>e.g. http://www.ota.ox.ac.uk/text/5730.xml</p>
      <p><textarea id="uri" name="uri" rows="2"></textarea></p>
      <p><input type="submit" value="Load"/></p>
    </form></div>
		
	</xsl:template>
	
	<xsl:template name="analytics">
		<script type="text/javascript">
		  var _gaq = _gaq || [];
		  _gaq.push(['_setAccount', 'UA-31051795-1']);
		  _gaq.push(['_trackPageview']);
		
		  (function() {
		    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		  })();
		</script>
	</xsl:template>
	

	<xsl:template match="eg:egXML">
		<xsl:element name="{local-name()}">
			<xsl:apply-templates select="@*"/>
			<xsl:call-template name="addID"/>
			<xsl:call-template name="xml-to-string">
				<xsl:with-param name="node-set">
					<xsl:copy-of select="node()"/>
				</xsl:with-param>
			</xsl:call-template>
		</xsl:element>
	</xsl:template>
	
	<xsl:template match="eg:egXML//comment()">
		<xsl:comment><xsl:value-of select="."/></xsl:comment>
	</xsl:template>

	
</xsl:stylesheet>
