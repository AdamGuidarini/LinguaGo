/* eslint-disable @typescript-eslint/no-require-imports */
// const browser = require('webextension-polyfill');

import Browser from "webextension-polyfill";

Browser.browserAction.onClicked.addListener(
    () => Browser.sidebarAction.open()
);
