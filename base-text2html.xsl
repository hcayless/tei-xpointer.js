<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:t="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="#all"
  version="2.0">
  
  <xsl:output media-type="text/html" omit-xml-declaration="yes"/>
  
  <xsl:template match="/">
    <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html>
</xsl:text>
    <html>
      <head>
        <title><xsl:value-of select="/t:TEI/t:teiHeader/t:fileDesc/t:titleStmt/t:title"/></title>
        <style type="text/css">
          .caps {
            text-transform:uppercase;
          }
          .quotation {
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div>
          <xsl:apply-templates select="//t:body"/>
        </div>
      </body>
    </html>
  </xsl:template>
  
  <xsl:template match="t:div">
    <div>
      <xsl:if test="@n"><xsl:attribute name="data-label"><xsl:value-of select="@n"/></xsl:attribute></xsl:if>
      <xsl:apply-templates/>
    </div>
  </xsl:template>
  
  <xsl:template match="t:ab">
    <p><xsl:apply-templates/></p>
  </xsl:template>
  
  <xsl:template match="t:seg">
    <span data-label="{@n}"><xsl:apply-templates/></span>
  </xsl:template>
  
  <xsl:template match="t:hi">
    <span class="{@rend}"><xsl:apply-templates/></span>
  </xsl:template>
  
  <xsl:template match="t:cit"><xsl:apply-templates select="t:bibl"/><xsl:apply-templates select="t:quote"/></xsl:template>
  
  <xsl:template match="t:quote">
    <span class="quotation"><xsl:apply-templates/></span>
  </xsl:template>
  
  <xsl:template match="t:cit/t:bibl">(<xsl:apply-templates/>)<xsl:text> </xsl:text></xsl:template>
  
</xsl:stylesheet>