// SRT Validator
import srtValidator from "srt-validator/dist/index";
import ParseError from "srt-validator/src/utils/parse-error";
import ValidationError from "srt-validator/src/utils/validation-error";

// SRT Parser
import * as srtParser from "srtparsejs";
import { KSRTArray } from './types';

// Korus
import regex from "@korusbyanthm/regex";

const removeComments = (src: string) => src.replace(/((?<!\\)#.{0,})\n/gi, "");

const defaultKSRTOptions = {
    // skipValidation: false,
    removeComments: true
};

/**
 * KSRT Class
 * 
 * Handles parsing, stringifying and playing
 */
export class KSRT {
    src: string;

    srtArray: srtParser.srtArray[];
    ksrtData: KSRTArray[] = [];

    player: srtParser.srtPlayer;

    options = defaultKSRTOptions;
    errors: (ParseError | ValidationError)[];

    constructor(src: string, options?: typeof defaultKSRTOptions) {
        // Set the options and src string
        this.options = {...this.options, ...options};
        this.src = src;

        // Filter the data and normalize it
        let filteredData = src;
        filteredData = this.options.removeComments ? removeComments(filteredData) : filteredData;
        filteredData = filteredData.normalize("NFC");

        // Parse the filtered data
        this.srtArray = srtParser.parse(filteredData);

        // Parse the KSRT data
        for (let srt of this.srtArray) {
            // Create datas and annotations objects
            const datas = {};
            const annotations = {};

            // Create base text where text from the lyrics can be added
            let text = "";

            // Create base note 
            let note = "";

            // Split the text into lines (containing KSRT data and annotations)
            for (let textLine of srt.text.split("\n")) {
                // Split into argument and value (won't be used when treated as just text)
                const [_arg, val] = textLine.split(/\s/, 2);
                const arg = _arg.replace(/^(:|!)/, "");

                console.log(textLine, arg, val)

                if (textLine.match(/(?<!\\):/gim)) {
                    // Handle data
                    datas[arg] = 
                        // Check if there is a value
                        val?.length >= 1?
                        // Split with ', '
                        val.split(/,\s/)
                        // Cast to a number if it's not an ID
                        .map(val => !regex.id(val) ? Number(val) ?? val : val) : 
                        // Use a true boolean if no value is provided
                        true;
                } else if (textLine.match(/(?<!\\)!/gim)) {
                    // Handle annotations
                    annotations[arg] = 
                        // Check if there is a valud
                        val?.length >= 1?
                        // Split with ', '
                        val.split(/,\s/)
                        // Cast to a number if it's not an ID
                        .map(val => !regex.id(val) ? Number(val) ?? val : val) : 
                        // Use a true boolean if no value is provided
                        true;
                } else if (textLine.match(/(?<!\\)&/gim)) {
                    // Handle note
                    note += `${textLine.replace(/^&/, "")}\n`;
                } else {
                    // Handle just text
                    text += `${textLine}\n`;
                };
            };

            // Add the data to the array
            this.ksrtData.push({
                endTime: srt.endTime,
                id: Number(srt.id),
                startTime: srt.startTime,
                text,
                note,
                ...datas,
                ...annotations,
            });
        };
    };

    /**
     * Stringify the data back into an SRT file
     */
    stringify(): string {
        return srtParser.toSrt(this.srtArray)
    };
};


/**
 * Alias for `new KSRT()`
 * @param src Text to parse
 * @returns {KSRT}
 */
export const parse = (src: string): KSRT => new KSRT(src);

/**
 * Alias for `KSRT.stringify`
 * @param ksrt `KSRT` class object
 * @returns {string}
 */
export const stringify = (ksrt: KSRT): string => ksrt.stringify();

export default { KSRT, parse, stringify };