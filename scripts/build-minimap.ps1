param(
  [Parameter(Mandatory = $true)][string]$InputFile,
  [string]$OutputFile = 'docs/assets/ozersk-map.svg'
)

$ErrorActionPreference = 'Stop'
$culture = [Globalization.CultureInfo]::InvariantCulture

function ConvertTo-MercatorY([double]$Latitude) {
  return [Math]::Log([Math]::Tan([Math]::PI / 4 + $Latitude * [Math]::PI / 360))
}

[xml]$osm = Get-Content -Raw -LiteralPath $InputFile
$west = 22.0139
$east = 22.0192
$north = ConvertTo-MercatorY 54.41252
$south = ConvertTo-MercatorY 54.40913
$nodes = @{}
foreach ($node in $osm.osm.node) {
  $x = 160 * ([double]$node.lon - $west) / ($east - $west)
  $y = 180 * ($north - (ConvertTo-MercatorY ([double]$node.lat))) / ($north - $south)
  $nodes[$node.id] = $x.ToString('0.#', $culture) + ',' + $y.ToString('0.#', $culture)
}

$styles = [ordered]@{
  park = 'fill="#302c2b"'
  water = 'fill="#263d46" stroke="#334c56" stroke-width=".6"'
  river = 'fill="none" stroke="#334b55" stroke-width="4.6"'
  stream = 'fill="none" stroke="#334b55" stroke-width="1.2"'
  building = 'fill="#433535" stroke="#644643" stroke-width=".45"'
  lane = 'fill="none" stroke="#5b4a47" stroke-width="1.25"'
  road = 'fill="none" stroke="#8b6962" stroke-width="2.8"'
}
$paths = @{}
foreach ($style in $styles.Keys) {
  $paths[$style] = [System.Collections.Generic.List[string]]::new()
}

foreach ($way in $osm.osm.way) {
  $tags = @{}
  foreach ($tag in $way.tag) {
    $tags[$tag.k] = $tag.v
  }
  $style = switch ($true) {
    ($tags.ContainsKey('building')) { 'building'; break }
    ($tags.natural -eq 'water') { 'water'; break }
    ($tags.natural -eq 'wood' -or $tags.landuse -in @('forest','grass','meadow','recreation_ground')) { 'park'; break }
    ($tags.waterway -eq 'river') { 'river'; break }
    ($tags.ContainsKey('waterway') -and -not $tags.ContainsKey('tunnel')) { 'stream'; break }
    ($tags.highway -in @('footway','path','service','track')) { 'lane'; break }
    ($tags.ContainsKey('highway')) { 'road'; break }
  }
  if (-not $style) { continue }
  $points = @($way.nd | ForEach-Object { $nodes[$_.ref] })
  if ($points.Count -lt 2 -or $points.Count -ne @($way.nd).Count) { continue }
  $closed = if ($style -in @('building','park','water')) { 'Z' } else { '' }
  $paths[$style].Add('M' + ($points -join ' ') + $closed)
}

$svg = @(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" width="160" height="180">'
  '  <desc>Map data © OpenStreetMap contributors, ODbL. https://www.openstreetmap.org/copyright</desc>'
  '  <path fill="#231b20" d="M0 0h160v180H0z"/>'
  '  <g stroke-linejoin="round" stroke-linecap="round">'
)
foreach ($style in $styles.Keys) {
  if ($paths[$style].Count -gt 0) {
    $svg += '    <path ' + $styles[$style] + ' d="' + ($paths[$style] -join '') + '"/>'
  }
}
$svg += '  </g>', '</svg>'
Set-Content -LiteralPath $OutputFile -Encoding utf8NoBOM -Value $svg
