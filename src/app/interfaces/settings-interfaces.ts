export interface ISettings {
    translator: Transaltor;
    libreTranslateUrl?: string;
    libreTranslateKey?: string;
}

export enum Transaltor {
    APERTIUM = 'apertium',
    LIBRETRANSLATE = 'libretranslate',
    GOOGLE = 'google'
}
