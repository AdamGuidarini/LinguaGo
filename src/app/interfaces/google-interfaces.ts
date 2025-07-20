export  interface IGoogleTranslateResponse {
    text: string;
    pronunciation: string | undefined;
    from: {
        didYouMean: boolean;
        iso: string;
        text: {
            autoCorrected: boolean;
            value: string;
            didYouMean: boolean;
        }
    };
    raw: string;
}