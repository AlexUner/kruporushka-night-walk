param(
  [Parameter(Mandatory = $true)][string]$InputFile,
  [string]$OutputFile = 'docs/assets/ozersk-map.svg',
  [switch]$Large
)

$ErrorActionPreference = 'Stop'
$culture = [Globalization.CultureInfo]::InvariantCulture

function ConvertTo-MercatorY([double]$Latitude) {
  return [Math]::Log([Math]::Tan([Math]::PI / 4 + $Latitude * [Math]::PI / 360))
}

[xml]$osm = Get-Content -Raw -LiteralPath $InputFile
$bounds = $osm.osm.bounds
$west = [double]$bounds.minlon
$east = [double]$bounds.maxlon
$north = ConvertTo-MercatorY ([double]$bounds.maxlat)
$south = ConvertTo-MercatorY ([double]$bounds.minlat)
$width = if ($Large) { 480 } else { 160 }
$height = if ($Large) { 396 } else { 180 }
$nodes = @{}
foreach ($node in $osm.osm.node) {
  $x = $width * ([double]$node.lon - $west) / ($east - $west)
  $y = $height * ($north - (ConvertTo-MercatorY ([double]$node.lat))) / ($north - $south)
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
$background = '#231b20'
if ($Large) {
  $background = '#241b1e'
  $styles.park = 'fill="#2e2a26" stroke="#3a332c" stroke-width=".65"'
  $styles.water = 'fill="#304248" stroke="#465b5f" stroke-width=".8"'
  $styles.river = 'fill="none" stroke="#506065" stroke-width="4.6"'
  $styles.stream = 'fill="none" stroke="#43585b" stroke-width="1.5"'
  $styles.building = 'fill="#48352d" stroke="#795648" stroke-width=".75"'
  $styles.lane = 'fill="none" stroke="#6e5349" stroke-width="1.35"'
  $styles.road = 'fill="none" stroke="#9c7662" stroke-width="3.2"'
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
  ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {0} {1}" width="{0}" height="{1}">' -f $width,$height)
  '  <desc>Map data © OpenStreetMap contributors, ODbL. https://www.openstreetmap.org/copyright</desc>'
  ('  <path fill="{0}" d="M0 0h{1}v{2}H0z"/>' -f $background,$width,$height)
  '  <g stroke-linejoin="round" stroke-linecap="round">'
)
foreach ($style in $styles.Keys) {
  if ($paths[$style].Count -gt 0) {
    $svg += '    <path ' + $styles[$style] + ' d="' + ($paths[$style] -join '') + '"/>'
  }
}
$svg += '  </g>', '</svg>'
Set-Content -LiteralPath $OutputFile -Encoding utf8NoBOM -Value $svg
