# Kruporushka night walk

The static site lives in `docs/`. Serve that directory with any static HTTP server. GitHub Pages publishes `main:/docs` without Jekyll. There is no build step.

The walk runs in the supplied order: street, bakery, bridge, left turn to the entrance, then the rocking chair. The scene names and route order are editorial. The editor at `map.html` starts centered on [Ozyorsk, Kaliningrad Oblast](https://www.openstreetmap.org/node/304337561) and uses Leaflet 1.9.4 with OpenStreetMap tiles.

The walk places its main controls over the source photograph so their locations scale with the image. The four positions in `docs/locations.js` come from the user's `kruporushka-points.json` export. The minimap emphasizes the current stop and shares the entrance marker with the indoor scene. The photographic sequence is user-directed. The map does not assert a walking path between stops. The editor uses the supplied positions as defaults for a fresh browser and preserves previously stored drafts and deletions.

The four WebP photographs derive from the supplied clipboard images in the order 4, 2, 3, 1. The H.264 room loop derives from `video_2026-11-14_16-10-22.mp4`: frames 5–102, light stabilization, a 608×456 center crop, subdued color and vignette, with the inner frames in reverse for the return. The webpage plays it silently and offers explicit play when reduced motion is enabled.

The initial visual alternatives, prompt and design rationale are in `design/`. The live pages use the user's source media.
