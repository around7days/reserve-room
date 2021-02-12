#!/bin/bash

cd `dirname $0`

# アプリ起動
node app/app.js &

# プロセスIDの保存
echo $! > app.pid

exit 0