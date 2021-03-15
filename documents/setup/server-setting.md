# CentOS 環境セットアップ

## 環境設定

```sh
# root ユーザ切換
$ su -

# アプリユーザ生成
$ useradd rs01
$ passwd rs01

# 配備先フォルダ生成
$ mkdir -p /opt/rs01/reserve-room
$ chown -R rs01:rs01 /opt/rs01

# nodejs, npm のインストール
$ yum install -y https://rpm.nodesource.com/pub_14.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm
$ yum install -y nodejs npm

# sqlite のインストール（入ってなければ）
$ yum install -y sqlite

# Git のインストール（入ってなければ）
$ yum install -y git

# C++コンパイラのインストール（入ってなければ）
# ※要らないかも・・・
$ yum install -y centos-release-scl
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

# アプリ起動・停止
$ /opt/rs01/reserve-room/startup.sh
```
