export interface ILibreLanguage {
    code: string;
    name: string;
    targets: string[];
}

export interface ILibreTranslation {
    translatedText: string;
    alternatives?: string[];
    detectedLanguage?: {
        confidence: number;
        language: string;
    };
}

export interface ILibreRequest {
    q: string;
    source: string;
    target: string;
    format?: string;
    alternatives?: number
}
