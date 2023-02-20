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

    srtArray: srtParser.srtArray[] = [];
    ksrtData: KSRTArray[] = [];

    player: srtParser.srtPlayer;

    options = defaultKSRTOptions;

    constructor(src?: string, options?: typeof defaultKSRTOptions) {
        // Set the options and src string
        this.options = {...this.options, ...options};
        this.src = src;
        src && this.parse();
    };

    /**
     * Add a new KSRT to the data
     * 
     */
    add(...ksrt: KSRTArray[]) {
        // Use correct IDs
        for (let [index, srt] of ksrt.entries())
            srt.id = this.ksrtData.length + index;

        // Add the data
        this.ksrtData.push(...ksrt);

        // Return new data
        return this.ksrtData;
    };

    /**
     * Parse the SRT string into an object
     */
    parse(src?: string) {
        // Filter the data and normalize it
        let filteredData = src ?? this.src;
        filteredData = this.options.removeComments ? removeComments(filteredData) : filteredData;
        filteredData = filteredData.normalize("NFC");

        // Parse the filtered data
        this.srtArray = srtParser.parse(filteredData);

        // Parse the KSRT data
        for (let srt of this.srtArray) {
            // Create datas and annotations objects
            const data = {};
            const annotations = {};

            // Create base text where text from the lyrics can be added
            let text = "";

            // Create base note 
            let note = "";

            // Split the text into lines (containing KSRT data and annotations)
            for (let textLine of srt.text.split("\n")) {
                const dataTarget = 
                    // If the line starts with a colon (:) and is not preceeded by a \, it's data
                    textLine.match(/^(?<!\\):/gim) ? data : 
                    // If the line starts with an exclamation mark (!) and is not proceeded by a \, it's an annotation
                    textLine.match(/^(?<!\\)!/gim) ? annotations : 
                    null;

                if (dataTarget) {
                    // Replace the start prefix of the line (arg)
                    const line = `${textLine.replace(/^(?<!\\):|!/, "")}`;
                    const [arg, ...vals] = line.split(" ");
                    const realVals = vals.map(val => val.replace(/,$/gim, "")).map(val => !regex.id(val) ? isNaN(Number(val)) ? val : Number(val) : val);
                    dataTarget[arg] = realVals.length > 1 ? realVals : realVals[0] ?? true;
                } else if (textLine.match(/(?<!\\)&/gim)) {
                    // Handle note
                    note += `${textLine.replace(/^&\s/, "")}\n`;
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
                text: text.replace(/\n$/im, ""),
                note,
                data,
                annotations,
            });
        };
    };

    /**
     * Stringify the data back into an SRT string
     */
    stringify(): string {
        // Create result string
        let res = "";

        // Stringify each KSRT script
        for (let ksrt of this.ksrtData) {
            // Add the stringified id
            res += `${ksrt.id.toString()}\n`;

            // Add the start and end times
            res += `${ksrt.startTime} --> ${ksrt.endTime}\n`;
            
            // Create text string where text, datas, notes and annotations will be added
            let text = "";

            // Add the text if any
            text += ksrt.text ? `${ksrt.text}\n` : "";
            
            // Add the note to the text
            text += ksrt.note ? `& ${ksrt.note}\n` : "";

            // Encode data into a string and add it to the text
            for (let [arg, val] of Object.entries(ksrt.data)) {
                text += `:${arg} ${Array.isArray(val) ? val.join(", ") : val === true ? "" : val}\n`;
            };

            // Encode annotations into a string and add it to the text
            for (let [arg, val] of Object.entries(ksrt.annotations)) {
                text += `!${arg} ${Array.isArray(val) ? val.join(", ") : val === true ? "" : val}\n`;
            };

            // Add a final new line to the text to separate from other scripts
            text += "\n"

            // Add the text to the result
            res += text;
        };

        return res;
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

/**
 * Create KSRT from Genius lyrics format
 * @param geniusLyrics Genius lyrics string
 * @returns {KSRT}
 */
export const fromGenius = (geniusLyrics: string): KSRT => {
    // Create empty KSRT
    const res = new KSRT();

    // Separate lines
    const lyricLines = geniusLyrics.split(/\n/gim);

    // Iterate over the lines
    for (let [index, lyricLine] of lyricLines.entries()) {

        // Skip if starts with [ (annotation) or doesn't have text
        if (
            lyricLine.startsWith("[") ||
            !lyricLine.match(/./gim)
        ) continue;

        // Add the data to the KSRT
        res.add({
            id: index,
            text: lyricLine,
            startTime: "00:00:00,00",
            endTime: "00:00:00,00",
            data: {},
            annotations: {
                // Add Genius part annotation if existing
                ...(typeof lyricLines[index - 1] === "string" && lyricLines[index - 1].startsWith("[") ? {
                    part: lyricLines[index - 1].replace(/^\[|\]$/gi, "").toLowerCase() as never
                } : {})
            }
        });
    };

    // Return KSRT
    return res;
};

const ksrt = {
    KSRT,
    parse,
    stringify,
    fromGenius
};
export default ksrt;