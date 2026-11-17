# Kruporushka night walk

The static site lives in `docs/`. Serve that directory with any static HTTP server. GitHub Pages publishes `main:/docs` without Jekyll. There is no build step.

The walk runs in the revised order: street, bridge, bakery, entrance, then the rocking chair. The scene names and route order are editorial. The editor at `map.html` uses Leaflet 1.9.4 and can show OpenStreetMap tiles over a packaged neighborhood map.

The walk places its main controls over the source photograph so their locations scale with the image. The four positions in `docs/locations.js` come from the user's `kruporushka-points.json` export. The north-up radar minimap moves its cursor between the actual stops, marks the next distinct location with an amber diamond, and shares the entrance marker with the indoor scene. A short sweep plays when the current location changes. The photographic sequence is user-directed. The map does not assert a walking path between stops. The editor uses the supplied positions as defaults for a fresh browser and preserves previously stored drafts and deletions.

The exported map artwork is served from `docs/assets/ozersk-map.svg`, so the walk makes no tile requests. It is derived from [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under the ODbL. To refresh the artwork, request the [mapped neighborhood bounds](https://api.openstreetmap.org/api/0.6/map?bbox=22.0139,54.40913,22.0192,54.41252) as OSM XML and run `./scripts/build-minimap.ps1 -InputFile PATH_TO_OSM_XML`. Keep the named bounds in `docs/locations.js` aligned with the export.

The larger radar and the city link open `route.html` at the current scene. That page has a standalone map of a wider neighborhood with photo links for all four positions and a link to the coordinate editor. A native shared transition expands the radar in browsers that support cross-document view transitions. Users with reduced motion and browsers without this feature use ordinary link navigation.

The enlarged map has a custom palette and uses `docs/assets/ozersk-route.svg`. To regenerate it, download the [wider OSM bounds](https://api.openstreetmap.org/api/0.6/map?bbox=22.0088,54.4066,22.0242,54.4140) and use `./scripts/build-minimap.ps1 -InputFile PATH_TO_OSM_XML -OutputFile docs/assets/ozersk-route.svg -Large`. The coordinate projection is shared by both maps. Keep `routeMapBounds` aligned with the large map's source bounds. The four map-only thumbnails use 168×112 crops. The design board, exact prompt and tradeoffs are recorded in `design/route-concepts.png`, `design/route-concept-prompt.txt` and `design/route-review.md`.

The four WebP photographs derive from the supplied clipboard images in the order 4, 3, 2, 1. Photos use 704 px and 1024 px longest-edge variants. The H.264 room loop derives from `video_2026-11-14_16-10-22.mp4`: frames 5-102, light stabilization, a 608×456 center crop, subdued color and vignette, with the inner frames in reverse for the return. The published encode is 576×432 at 24 fps and stays unloaded until playback. The webpage plays it silently and offers explicit play when reduced motion is enabled.

The initial visual alternatives, prompt and design rationale are in `design/`. The live pages use the user's source media.
