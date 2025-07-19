export interface IApertiumResponse<T> {
    responseData: T;
    responseDetails: unknown;
    responseStatus: number;
}

export interface IApertiumTranslationRepsonse {
    translatedText: string;
}

export type IApertiumLanguageNames = Record<string, string>;

export interface IApertiumLanguageCode {
    sourceLanguage: string;
    targetLanguage: string;
}

export interface IApertiumLanguage {
    code: string;
    name: string;
    pairsWith: string[];
}

export type IApertiumIdentification = Record<string, number>;
