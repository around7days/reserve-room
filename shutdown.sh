#!/bin/bash

cd `dirname $0`

# PIDを指定してKill
kill -9 `cat app.pid`

# PIDファイルの削除
rm app.pid

exit 0