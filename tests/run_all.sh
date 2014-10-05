#!/bin/sh

pass=0
fail=0
skip=0

PWD=`pwd`
DIR=`basename $PWD`
if [ $DIR != "tests" ]; then
  cd tests
fi
FAILED=""

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
            FAILED="$FAILED\n  $1"
        fi
    else
        echo "Skip test $1"
        echo "----------------------------------------"
        skip=`expr $skip + 1`
    fi
    echo "========================================"
    echo
}

# Alphabetical order.
run_test ArrayBuffer_test.js
run_test ArrayBufferFile_test.js
run_test DISABLED_chrome.socket_test.js
run_test DNS_test.js
run_test File_test.js
run_test MD5_test.js
run_test Promise_test.js
run_test ScreenModel_test.js
run_test TextModel_test.js
run_test TextModelConvert_test.js
run_test Unicode_test.js

echo "========================================"
echo "----------------------------------------"
echo "Pass $pass / Fail $fail / Skip $skip"
if [ $fail -ne 0 ]; then
    echo "----------------------------------------"
    echo "Failed tests:$FAILED"
fi
echo "----------------------------------------"
echo "========================================"

exit $fail
