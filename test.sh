#!/bin/sh

run_test () {
    echo "========================================"
    echo "Running test $1"
    echo "----------------------------------------"
    node $1
    echo "----------------------------------------"
    echo "Done."
    echo "========================================"
    echo
}

run_test ArrayBuffer_test.js &&
# DISABLED run_test chrome.socket_test.js
run_test DNS_test.js &&
run_test MD5_test.js &&
run_test Unicode_test.js &&
run_test TextModel_test.js &&
run_test TextModelConvert_test.js &&
run_test ScreenModel_test.js &&
exit 0
