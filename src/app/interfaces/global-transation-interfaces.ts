export interface ILanguage {
    code: string;
    name: string;
    targets?: string[];
}

export interface ITranslation {
    source: string;
    target: string;
    result: string;
    original: string;
    confidence?: number;
}
