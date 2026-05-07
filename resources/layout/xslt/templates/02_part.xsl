	<xsl:template match="Part">
		<section class="fm-part">
			<xsl:attribute name="data-part-type">
				<xsl:value-of select="@type"/>
			</xsl:attribute>
			<xsl:if test="Definition/@size">
				<xsl:attribute name="style">
					<xsl:text>min-height:</xsl:text>
					<xsl:value-of select="Definition/@size"/>
					<xsl:text>px;</xsl:text>
				</xsl:attribute>
			</xsl:if>

			<div class="fm-part-title">
				<xsl:value-of select="@type"/>
				<xsl:if test="@name">
					<xsl:text> / </xsl:text>
					<xsl:value-of select="@name"/>
				</xsl:if>
			</div>
			<div class="fm-part-body">
				<xsl:apply-templates select="ObjectList/LayoutObject"/>
			</div>
		</section>
	</xsl:template>
