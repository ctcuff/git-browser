// Type definitions aren't publicly available yet so they need to be
// specified manually here
// https://github.com/google/model-viewer/issues/1502
// https://github.com/google/model-viewer/pull/1831
declare module '@google/model-viewer' {
  declare global {
    namespace JSX {
      interface IntrinsicElements {
        'model-viewer':
          | ModelViewerJSX
          | React.DetailedHTMLProps<
              React.HTMLAttributes<HTMLElement>,
              HTMLElement
            >
      }
    }
  }

  interface ModelViewerJSX {
    src: string
    ref: React.LegacyRef<ModelViewerElement>
    class: string
    poster?: string
  }

  interface ModelViewerElement extends Element {
    animationName: string
    loaded: boolean
    availableAnimations: string[]
    modelIsVisible: boolean
    pause: () => void
    play: () => void
  }
}
