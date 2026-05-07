	<xsl:template match="LayoutObject">
		<xsl:variable name="w" select="number(Bounds/@right) - number(Bounds/@left)"/>
		<xsl:variable name="h" select="number(Bounds/@bottom) - number(Bounds/@top)"/>
		<div>
			<xsl:attribute name="class">
				<xsl:text>fm-object </xsl:text>
				<xsl:value-of select="concat('fm-object-', translate(lower-case(@type),' ', '-'))"/>
			</xsl:attribute>
			<xsl:attribute name="style">
				<xsl:text>left:</xsl:text><xsl:value-of select="Bounds/@left"/><xsl:text>px; top:</xsl:text>
				<xsl:value-of select="Bounds/@top"/><xsl:text>px; width:</xsl:text>
				<xsl:value-of select="format-number($w,'0')"/><xsl:text>px; height:</xsl:text>
				<xsl:value-of select="format-number($h,'0')"/><xsl:text>px;</xsl:text>
			</xsl:attribute>

			<div class="fm-object-label">
				<xsl:choose>
					<xsl:when test="normalize-space(@name)!=''">
						<xsl:value-of select="@name"/>
					</xsl:when>
					<xsl:when test="FieldReference/@name">
						<xsl:value-of select="FieldReference/@name"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="@type"/>
					</xsl:otherwise>
				</xsl:choose>
			</div>

			<xsl:if test="Text/StyledText/Data">
				<div class="fm-object-meta">
					<xsl:value-of select="normalize-space(Text/StyledText/Data)"/>
				</div>
			</xsl:if>

			<xsl:if test="FieldReference">
				<div class="fm-object-meta">
					<xsl:text>Field: </xsl:text>
					<xsl:value-of select="concat(FieldReference/@name, ' (', FieldReference/TableOccurrenceReference/@name, ')')"/>
				</div>
			</xsl:if>

			<xsl:if test="Button/Label/Calculation/Text">
				<div class="fm-object-meta">
					<xsl:text>Label: </xsl:text>
					<xsl:value-of select="normalize-space(Button/Label/Calculation/Text)"/>
				</div>
			</xsl:if>

			<xsl:apply-templates select="*/ObjectList/LayoutObject"/>
		</div>
	</xsl:template>
