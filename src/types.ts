export interface KSRTDataMap {
    /**
     * Last Edited
     * 
     * `[<userId: string>, <timestamp: number>]`
     */
    le?: [string, number];
    /**
     * Emphasis
     * 
     * `<emphasis: number>`
     */
    em?: number;
    /**
     * Writers
     * `[...<userId: string>]`
     */
    wr?: string[];
    /**
     * Karaoke (timestamps)
     * `[...<offset: number>]`
     */
    kr?: number[];
};

export const KSRTAnnotationParts = <const>["intro", "verse", "refrain", "prechorus", "chorus", "bridge", "outro", "hook"];
export type KSRTAnnotationPart = typeof KSRTAnnotationParts[number];

export const KSRTAnnotationVoices = <const>["PP", "P", "MP", "MF", "F", "FF"];
export type KSRTAnnotationVoice = typeof KSRTAnnotationVoices[number];

export interface KSRTAnnotationMap {
    /**
     * Voice strength
     */
    voice?: KSRTAnnotationVoice;
    /**
     * Singer index
     */
    singer?: number[];
    /**
     * Verse index
     */
    verse?: number;
    /**
     * Part in the song
     */
    part?: KSRTAnnotationPart;
    /**
     * Instrumental part
     */
    instrumental?: boolean;
};

export interface KSRTArray {
    endTime: string;
    id: number;
    startTime: string;
    text: string;
    note?: string;
    data: KSRTDataMap;
    annotations: KSRTAnnotationMap;
};