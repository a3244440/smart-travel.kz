# Motion reel (promo/smart-travel-motion-reel.mp4)

15-second showreel, 1920×1080, 60 fps. Every frame is generated from code.

- `reel.html`: eight scenes with a `seek(t)` timeline (shape, depth, type, map, UI, data, masks, logo)
- `dots.mjs`: builds the dot map (`dots.json`) from Natural Earth (`world-atlas`, `topojson-client`)
- `render.mjs`: renders frames in Playwright, several subframes per frame
- `blur.py`: averages the subframes into motion blur and streams the frames to ffmpeg
- `sound.py`: sound design (whooshes, hits, ticks), synced to the animation cues

The build also needs the `m/` (photos, logo) and `f/` (Manrope, Cormorant Garamond, OFL) folders next to `reel.html`.
