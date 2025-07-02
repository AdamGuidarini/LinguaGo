import { AxiosResponse, AxiosStatic } from "axios";

export class GoogleTranslateService {
    private _axios: AxiosStatic;
    private readonly baseEndpoint = ''

    constructor(axios: AxiosStatic) {
        this._axios = axios
    }

    async getLanguages(): Promise<AxiosResponse<any, any>> {
        return await this._axios.get(
            'https://translation.googleapis.com/translate?aLang=en&sl=auto&tl=langlist&text='
        );
    }
}
