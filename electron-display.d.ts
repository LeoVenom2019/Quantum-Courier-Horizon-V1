export {};

declare global {
  type QchDisplayMode = 'fullscreen' | 'windowed';

  type QchDisplayState = {
    mode: QchDisplayMode;
    resolution: string;
    width: number;
    height: number;
    availableResolutions: string[];
  };

  interface Window {
    qchDesktop?: {
      display: {
        getState: () => Promise<QchDisplayState | null>;
        apply: (settings: { mode: QchDisplayMode; resolution?: string }) => Promise<QchDisplayState | null>;
        onChanged: (callback: (state: QchDisplayState) => void) => () => void;
      };
    };
  }
}
