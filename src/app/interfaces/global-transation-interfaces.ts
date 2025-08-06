import { Observable } from "rxjs";
import { Transaltor } from "./settings-interfaces";

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
    alternatives?: string[];
    key?: string;
    timestamp?: string;
    translator?: Transaltor
}

export interface ITranslator {
    getLanguages: () => Observable<ILanguage[]>;
    translate: (source: string, target: string, text: string) => Observable<ITranslation>
}
