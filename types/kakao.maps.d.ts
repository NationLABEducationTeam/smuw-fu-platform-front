declare global {
    interface Window {
      kakao: {
        maps: {
          LatLng: new (lat: number, lng: number) => any;
          Map: new (container: HTMLElement, options: any) => any;
          ZoomControl: new () => any;
          MapTypeControl: new () => any;
          MapTypeId: {
            ROADMAP: any;
          };
          ControlPosition: {
            RIGHT: any;
            TOPRIGHT: any;
          };
          event: {
            addListener: (target: any, type: string, handler: Function) => void;
          };
          load: (callback: () => void) => void;
        };
      };
    }
  }
  
  export {};