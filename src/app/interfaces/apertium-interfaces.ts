export interface IApertiumResponse<T> {
    responseData: T;
    responseDetails: unknown;
    responseStatus: number;
}

export interface IApertiumTranslationRepsonse {
    translateText: string;
}

export interface IApertiumLanguageNames {
    [key: string]: string;
}

export interface IApertiumLanguageCode {
    sourceLanguage: string;
    targetLanguage: string;
}

export interface IApertiumLanguage {
    code: string;
    name: string;
    pairsWith: string[];
}

export interface IApertiumIdentification {
    [key: string]: number;
}
