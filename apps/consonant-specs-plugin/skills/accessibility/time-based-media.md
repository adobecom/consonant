# Time-Based Media

Captions, transcripts, and audio descriptions for video and audio content. Use this as the primary reference when filling the Time-Based Media card.

---

## Captions (WCAG 1.2.2)

All prerecorded video with audio MUST have synchronized captions.

**Requirements:**
- Captions must be synchronized with the audio
- Include speaker identification when multiple speakers
- Include relevant sound effects: [applause], [music playing], [door slams]
- Provide `<track kind="captions">` element
- Captions must be accurate — auto-generated captions need human review

**Live captions (WCAG 1.2.4, AA):**
- Live video with audio must have real-time captions
- Can use CART (Communication Access Realtime Translation) or auto-captioning

## Transcripts (WCAG 1.2.1)

**Audio-only content** (podcasts, audio clips) MUST have a text transcript.

**Video-only content** (animations, silent demos) MUST have either:
- A text transcript describing the visual content, OR
- An audio description track

## Audio Descriptions (WCAG 1.2.3, 1.2.5)

Prerecorded video MUST have audio descriptions for visual-only content that isn't conveyed through the existing audio track.

**When needed:**
- Visual actions not described in dialogue
- On-screen text (titles, credits, captions within video)
- Scene changes important to understanding
- Facial expressions or gestures that convey meaning

**Implementation:**
- Separate audio track with descriptions inserted during natural pauses
- Extended audio descriptions that pause video if natural pauses are insufficient

## Audio Control (WCAG 1.4.2)

- No auto-playing audio longer than 3 seconds
- If auto-playing: provide pause, stop, or volume control
- Control must be at the beginning of the page (before content)

## Detection Heuristics for Figma

- Look for video player components (play button, progress bar, controls)
- Check for embedded media frames (YouTube, Vimeo placeholders)
- Look for audio player components
- Check for hero sections with video backgrounds
- Look for animation/motion graphics that might need descriptions

## Blueline Card Output

- Title = media element (e.g. "Hero video", "Product demo", "Podcast player")
- Desc = requirement (e.g. "Prerecorded video — provide synchronized captions via <track> element and transcript link below player")
- Notes = cite WCAG 1.2.2 for captions, 1.2.1 for transcripts, 1.2.5 for audio descriptions
- Warnings = video without visible caption controls, auto-playing media, missing transcript links
