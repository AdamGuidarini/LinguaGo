export interface ISettings {
    translator: 'apertium' | 'libretranslate' | 'google';
    libreTranslateUrl?: string;
    libreTranslateKey?: string;
}