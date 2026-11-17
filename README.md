# Kruporushka night walk

The static site lives in `docs/`. Serve that directory with any static HTTP server. GitHub Pages publishes `main:/docs` without Jekyll. There is no build step.

The walk runs in the revised order: street, bridge, bakery, entrance, then the rocking chair. The scene names and route order are editorial. The editor at `map.html` uses Leaflet 1.9.4 and can show OpenStreetMap tiles over a packaged neighborhood map.

The walk places its main controls over the source photograph so their locations scale with the image. The four positions in `docs/locations.js` come from the user's `kruporushka-points.json` export. The north-up radar minimap moves its cursor between the actual stops, marks the next distinct location with an amber diamond, and shares the entrance marker with the indoor scene. A short sweep plays when the current location changes. The photographic sequence is user-directed. The map does not assert a walking path between stops. The editor uses the supplied positions as defaults for a fresh browser and preserves previously stored drafts and deletions.

The exported map artwork is served from `docs/assets/ozersk-map.svg`, so the walk makes no tile requests. It is derived from [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under the ODbL. To refresh the artwork, request the [mapped neighborhood bounds](https://api.openstreetmap.org/api/0.6/map?bbox=22.0139,54.40913,22.0192,54.41252) as OSM XML and run `./scripts/build-minimap.ps1 -InputFile PATH_TO_OSM_XML`. Keep the named bounds in `docs/locations.js` aligned with the export.

The four WebP photographs derive from the supplied clipboard images in the order 4, 3, 2, 1. Photos use 704 px and 1024 px longest-edge variants. The H.264 room loop derives from `video_2026-11-14_16-10-22.mp4`: frames 5-102, light stabilization, a 608×456 center crop, subdued color and vignette, with the inner frames in reverse for the return. The published encode is 576×432 at 24 fps and stays unloaded until playback. The webpage plays it silently and offers explicit play when reduced motion is enabled.

The initial visual alternatives, prompt and design rationale are in `design/`. The live pages use the user's source media.
