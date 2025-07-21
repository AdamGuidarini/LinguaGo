# LinguaGo

A browser extension to help translate as you browse the web.

## About

LinguaGo is a browser extension created with Angular to make it easier to looks up words in foreign languages as you read in them.

## Translators

### Apertium

Apertium is a free and open source machine translator hosted by developers themselves. It supports a wide vareity of language pairs and is the LinguaGo's default translator

See more: https://www.apertium.org/index.eng.html

### LibreTranslate

LibreTranslate is another free and open source translation model, however it the base endpoint must requires a paid key. It can however be self-hosted or even run locally. Because of this restriction, users must provide their own URL and (optional) key for this option. The URL and API key can be entered in the extension's settings tab.

See more: https://libretranslate.com/

### Google Translate (Unofficial)

LinguaGo uses an unofficial API for Google Translate to provide a more robust translation engine than Apertium with more flexibilty than Apertium.

See more: https://www.npmjs.com/package/google-translate-api-x, https://translate.google.com
