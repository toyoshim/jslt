#!/bin/sh

node ArrayBuffer_test.js &&
# DISABLED node chrome.socket_test.js
node DNS_test.js &&
node MD5_test.js &&
node TextModel_test.js &&
exit 0