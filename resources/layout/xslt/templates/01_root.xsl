	<xsl:template match="/FMSaveAsXML">
		<xsl:for-each select="Structure/AddAction/LayoutCatalog/Layout[@isFolder!='True']">
			<xsl:variable name="safeName"
				select="replace(normalize-space(@name),'[^0-9A-Za-zぁ-んァ-ヶ一-龠._-]+','_')"/>
			<xsl:variable name="fileName"
				select="concat($outputDir,'/',format-number(position(),'000'),'_', $safeName,'.html')" />

			<xsl:result-document href="{$fileName}" method="html" indent="yes" encoding="UTF-8">
				<html lang="ja">
					<head>
						<meta charset="UTF-8"/>
						<title>
							<xsl:value-of select="normalize-space(@name)"/>
						</title>
						<style>
							body { font-family: "Hiragino Sans","Yu Gothic","Helvetica Neue",sans-serif; margin: 0; background: #f5f5f7; }
							.fm-layout { position: relative; margin: 2rem auto; background: #fff; border: 1px solid #d0d0d7; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
							.fm-layout-meta { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e5ea; background: #fafafa; font-size: 0.85rem; color: #555; }
							.fm-parts { position: relative; padding: 1rem; }
							.fm-part { position: relative; margin-bottom: 1rem; padding: 0.5rem; border: 1px dashed #c8c8d0; background: rgba(30,130,255,0.03); }
							.fm-part-title { font-size: 0.85rem; font-weight: bold; margin-bottom: 0.35rem; color: #333; }
							.fm-part-body { position: relative; min-height: 60px; background: #fff; border: 1px solid #e0e0ea; }
							.fm-object { position: absolute; border: 1px solid rgba(0,0,0,0.2); border-radius: 4px; background: rgba(255,255,255,0.9); padding: 0.25rem 0.4rem; box-sizing: border-box; overflow: hidden; }
							.fm-object-label { font-size: 0.75rem; font-weight: 600; color: #111; }
							.fm-object-meta { font-size: 0.7rem; color: #666; margin-top: 0.2rem; }
							.fm-object.fm-object-button { background: #0366d6; color: #fff; border-color: #024c9e; }
							.fm-object.fm-object-field { background: #eef5ff; border-style: solid; }
							code { font-family: "SFMono-Regular","Consolas","Menlo",monospace; font-size: 0.72rem; }
							<xsl:for-each select=".//LocalCSS">
								<xsl:text>&#x0A;</xsl:text>
								<xsl:value-of select="."/>
							</xsl:for-each>
						</style>
					</head>
					<body>
						<xsl:variable name="layoutWidth" select="number(@width)" />
						<div class="fm-layout">
							<xsl:attribute name="style">
								<xsl:text>width:</xsl:text>
								<xsl:value-of select="if ($layoutWidth gt 0) then $layoutWidth else 1024"/>
								<xsl:text>px;</xsl:text>
							</xsl:attribute>

							<div class="fm-layout-meta">
								<strong>レイアウト名:</strong>
								<xsl:value-of select="@name"/>
								<xsl:text> | TO: </xsl:text>
								<xsl:value-of select="TableOccurrenceReference/@name"/>
								<xsl:text> | Theme: </xsl:text>
								<xsl:value-of select="LayoutThemeReference/@name"/>
							</div>

							<div class="fm-parts">
								<xsl:apply-templates select="PartsList/Part"/>
							</div>
						</div>
					</body>
				</html>
			</xsl:result-document>
		</xsl:for-each>
	</xsl:template>
