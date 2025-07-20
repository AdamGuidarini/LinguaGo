/* eslint-disable @typescript-eslint/no-explicit-any */
import { singleTranslate } from "google-translate-api-x";
import Browser from "webextension-polyfill";
import { ITranslateMessage } from "./interfaces/translate-message-interfaces";

Browser.browserAction.onClicked.addListener(
    () => Browser.sidebarAction.open()
);

const googleTranslateListener: Browser.Runtime.OnMessageListenerCallback = (message: unknown, sender: any, response: any) => {
    const mes = message as ITranslateMessage;

    if (mes.service !== 'GoogleTranslateService') {
        return true;
    }

    singleTranslate(mes.text, { to: mes.target, from: mes.source })
        .then((result) => {
            response({ success: true, result });
        })
        .catch((reason) => {
            console.error(reason);
            response({ success: false, error: reason });
        });

    return true;
};

Browser.runtime.onMessage.addListener(googleTranslateListener);

