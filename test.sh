#!/bin/sh

pass=0
fail=0
skip=0

run_test () {
    echo "========================================"
    echo $1 | grep '^DISABLED_' > /dev/null 2> /dev/null
    if [ $? -ne 0 ]; then
        echo "Running test $1"
        echo "----------------------------------------"
        node $1
        rc=$?
        echo "----------------------------------------"
        if [ $rc -eq 0 ]; then
            echo "* PASS"
            pass=`expr $pass + 1`
        else
            echo "* FAIL"
            fail=`expr $fail + 1`
        fi
    else
        echo "Skip test $1"
        echo "----------------------------------------"
        skip=`expr $skip + 1`
    fi
    echo "========================================"
    echo
}

run_test ArrayBuffer_test.js
run_test DISABLED_chrome.socket_test.js
run_test DNS_test.js
run_test MD5_test.js
run_test Unicode_test.js
run_test TextModel_test.js
run_test TextModelConvert_test.js
run_test ScreenModel_test.js

echo "========================================"
echo "----------------------------------------"
echo "Pass $pass / Fail $fail / Skip $skip"
echo "----------------------------------------"
echo "========================================"

exit $fail
