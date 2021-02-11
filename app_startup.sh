#bin/bash

cd /opt/rs01/reserve-room/

# アプリ起動
node app/app.js &
pid=$1

# プロセスIDの保存
echo ${pid} > app.pid