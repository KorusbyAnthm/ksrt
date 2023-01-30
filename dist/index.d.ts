import ParseError from "srt-validator/src/utils/parse-error";
import ValidationError from "srt-validator/src/utils/validation-error";
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
    errors: (ParseError | ValidationError)[];
    constructor(src?: string, options?: typeof defaultKSRTOptions);
    add(...ksrt: KSRTArray[]): KSRTArray[];
    parse(src?: string): void;
    stringify(): string;
}
export declare const parse: (src: string) => KSRT;
export declare const stringify: (ksrt: KSRT) => string;
declare const _default: {
    KSRT: typeof KSRT;
    parse: (src: string) => KSRT;
    stringify: (ksrt: KSRT) => string;
};
export default _default;
