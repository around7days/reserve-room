# CentOS 環境セットアップ

## 環境設定

```sh
# root ユーザ切換
$ su -

# アプリユーザ生成
$ useradd rs01
$ passwd rs01

# sudo権限の付与
$ visudo
※以下の設定を追加 （root ALL=(ALL) ALLのあたり）
-----------------------------------------------
rs01   ALL=(ALL)       ALL
-----------------------------------------------

# 配備先フォルダ生成
$ mkdir -p /opt/rs01/reserve-room
$ chown -R rs01:rs01 /opt/rs01

# 汎用ライブラリのインストール
$ yum -y install wget

# nodejs, npm のインストール
$ yum install -y https://rpm.nodesource.com/pub_14.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm
$ yum install -y nodejs npm

# sqlite のインストール（入ってなければ）
$ yum install -y sqlite

# Git のインストール（入ってなければ）
$ yum install -y git

# C++コンパイラのインストール（入ってなければ）
$ yum install -y gcc-c++
```

## アプリ配備

```sh
# ユーザ切換
$ su - rs01

# アプリ配備先に移動
$ cd /opt/rs01

# GitHubからアプリをclone
$ git clone https://github.com/around7days/reserve-room.git

# アプリディレクトリに移動
$ cd /opt/rs01/reserve-room

# 外部モジュール最新化
$ npm update

# DBセットアップ
$ mkdir data
$ sqlite3 ./data/sqlite.db < ./documents/setup/schema.sql
$ sqlite3 ./data/sqlite.db < ./documents/setup/data.sql

# shell の実行権限設定
$ chmod 744 ./*.sh

# 起動
$ /opt/rs01/reserve-room/startup.sh
```

## アプリ最新化

```sh
# ユーザ切換
$ su - rs01

# アプリディレクトリに移動
$ cd /opt/rs01/reserve-room

# GitHubからアプリをpull
$ git pull

# 外部モジュール最新化
$ npm update
```

## アプリ自動起動設定（うまいこといってない・・・）
```sh
# root ユーザ切換
$ su -

# 自動起動設定ファイル作成
$ vi /etc/systemd/system/reserve-room.service
---------------------------------------------
[Unit]
Description=reserve-room service

[Service]
User=rs01
ExecStart=/opt/rs01/reserve-room/startup.sh
Restart=always
Type=simple

[Install]
WantedBy=multi-user.target
---------------------------------------------

# 自動起動設定
$ systemctl daemon-reload
$ systemctl enable reserve-room
```
