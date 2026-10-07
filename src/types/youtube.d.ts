// Browser API loaded at runtime by Shadowing; independent of retired UI.
interface Window {
  YT: any;
  onYouTubeIframeAPIReady: (() => void) | undefined;
}
