#bin/bash

cd /opt/rs01/reserve-room/

# プロセスIDの取得
pid='echo app.pid'
kill -9 ${pid}