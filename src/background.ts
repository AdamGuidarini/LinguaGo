import { GoogleTranslateService } from './services/google-translate.service';
import axios, { AxiosResponse, AxiosError } from 'axios';

console.log('hello');

const googleTranslateService = new GoogleTranslateService(axios);

console.log('foo');

const langs = googleTranslateService.getLanguages();

console.log(langs);
