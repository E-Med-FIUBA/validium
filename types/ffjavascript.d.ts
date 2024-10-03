// types/ffjavascript.d.ts
declare module "ffjavascript" {
  export function getCurveFromName(name: string, debug: boolean): Promise<any>;
  export const Scalar: {
    bits: (x: any) => boolean[];
  };
}
