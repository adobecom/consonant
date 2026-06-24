import { html, nothing } from "lit";
import { Directive, directive } from "lit/directive.js";
import { ControlButton } from "../control-button/control-button.js";
import { IconPlay, IconPause } from "../icons/icons.js";
import "./immersive-card.css";

// Element directive — fires on every render, calls play() or pause() directly.
class VideoPlaybackDirective extends Directive {
  update(part, [playing]) {
    const video = part.element;
    if (playing) {
      video.play?.().catch?.(() => {});
    } else {
      video.pause?.();
    }
    return nothing;
  }
  render() { return nothing; }
}
const videoPlayback = directive(VideoPlaybackDirective);

export const ImmersiveCard = ({
  imageSrc,
  imageAlt = "",
  videoSrc,
  headline = "",
  body = "",
  showControl = true,
  playing = true,
  onControlClick,
} = {}) => html`
  <div class="c-immersive-card">
    ${videoSrc
      ? html`
        <div class="c-immersive-card__media" aria-hidden="true">
          <video
            class="c-immersive-card__video"
            src=${videoSrc}
            ${videoPlayback(playing)}
            autoplay
            loop
            muted
            playsinline
            preload="metadata"
          ></video>
          <span class="c-immersive-card__overlay"></span>
        </div>
      `
      : imageSrc
      ? html`
        <div class="c-immersive-card__media" aria-hidden="true">
          <img class="c-immersive-card__image" src=${imageSrc} alt=${imageAlt} loading="lazy" decoding="async" />
          <span class="c-immersive-card__overlay"></span>
        </div>
      `
      : nothing}
    <div class="c-immersive-card__text">
      ${headline ? html`<p class="c-immersive-card__headline">${headline}</p>` : nothing}
      ${body ? html`<p class="c-immersive-card__body">${body}</p>` : nothing}
    </div>
    ${showControl
      ? ControlButton({
          icon: playing ? IconPause() : IconPlay(),
          label: playing ? "Pause" : "Play",
          size: "md",
          context: "on-dark",
          background: "solid",
          onClick: onControlClick,
        })
      : nothing}
  </div>
`;
