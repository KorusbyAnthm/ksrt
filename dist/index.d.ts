import * as srtParser from "srtparsejs";
import { KSRTArray } from './types';
declare const defaultKSRTOptions: {
    removeComments: boolean;
};
export declare class KSRT {
    src: string;
    srtArray: srtParser.srtArray[];
    ksrtData: KSRTArray[];
    player: srtParser.srtPlayer;
    options: {
        removeComments: boolean;
    };
    constructor(src?: string, options?: typeof defaultKSRTOptions);
    add(...ksrt: KSRTArray[]): KSRTArray[];
    parse(src?: string): void;
    stringify(): string;
}
export declare const parse: (src: string) => KSRT;
export declare const stringify: (ksrt: KSRT) => string;
export declare const fromGenius: (geniusLyrics: string) => KSRT;
declare const ksrt: {
    KSRT: typeof KSRT;
    parse: (src: string) => KSRT;
    stringify: (ksrt: KSRT) => string;
    fromGenius: (geniusLyrics: string) => KSRT;
};
export default ksrt;
