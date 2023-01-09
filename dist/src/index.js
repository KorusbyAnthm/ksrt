"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = exports.parse = exports.KSRT = void 0;
// SRT Parser
const srtParser = __importStar(require("srtparsejs"));
// const removeComments = (src: string) => src.replace(/(?<!\\)#.{0,}/gi, "");
/**
 * KSRT Class
 */
class KSRT {
    constructor(src) {
        this.src = src;
        let filteredData = src;
        // filteredData = removeComments(filteredData);
        this.data = srtParser.parse(filteredData);
    }
    ;
    /**
     * Stringify the data back into an SRT file
     */
    stringify() {
        return srtParser.toSrt(this.data);
    }
    ;
}
exports.KSRT = KSRT;
;
/**
 * Alias for `new KSRT()`
 * @param src Text to parse
 * @returns {KSRT}
 */
const parse = (src) => new KSRT(src);
exports.parse = parse;
/**
 * Alias for `KSRT.stringify`
 * @param ksrt `KSRT` class object
 * @returns {string}
 */
const stringify = (ksrt) => ksrt.stringify();
exports.stringify = stringify;
exports.default = { KSRT, parse: exports.parse, stringify: exports.stringify };
