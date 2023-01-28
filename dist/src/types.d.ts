export interface KSRTDataMap {
    le?: [string, number];
    em?: number;
    wr?: string[];
    kr?: number[];
}
export declare const KSRTAnnotationParts: readonly ["intro", "verse", "refrain", "prechorus", "chorus", "bridge", "outro", "hook"];
export type KSRTAnnotationPart = typeof KSRTAnnotationParts[number];
export declare const KSRTAnnotationVoices: readonly ["PP", "P", "MP", "MF", "F", "FF"];
export type KSRTAnnotationVoice = typeof KSRTAnnotationVoices[number];
export interface KSRTAnnotationMap {
    voice?: KSRTAnnotationVoice;
    singer?: number[];
    verse?: number;
    part?: KSRTAnnotationPart;
    instrumental?: boolean;
}
export interface KSRTArray {
    endTime: string;
    id: number;
    startTime: string;
    text: string;
    note?: string;
    data: KSRTDataMap;
    annotations: KSRTAnnotationMap;
}
