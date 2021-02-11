# CentOS 環境セットアップ

## rootユーザ切換
su -

## ユーザ生成

useradd rs01
passwd rs01

## 配備先フォルダ生成

mkdir -p /opt/rs01/reserve-room
chown -R rs01:rs01 /opt/rs01

## nodejs, npm のインストール

yum install -y https://rpm.nodesource.com/pub_14.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm
yum install -y nodejs npm

## sqlite のインストール（入ってなければ）

yum install -y sqlite

## C++コンパイラのインストール（入ってなければ）

yum install -y centos-release-scl ※要らないかも・・・
yum install -y gcc-c++

# アプリセットアップ

## アプリ配備

FFFTPやWinSCP等で下記フォルダにrs01ユーザでアプリを配備。
/opt/rs01/reserve-room
　※data,logs,node_modules フォルダは配備不要。

## ユーザ切換

su - rs01

## shellの実行権限設定

chmod 744 /opt/rs01/reserve-room/*.sh

## DB セットアップ

mkdir /opt/rs01/reserve-room/data
sqlite3 /opt/rs01/reserve-room/data/sqlite.db < /opt/rs01/reserve-room/documents/setup/schema.sql
sqlite3 /opt/rs01/reserve-room/data/sqlite.db < /opt/rs01/reserve-room/documents/setup/data.sql

## 外部モジュール最新化

cd /opt/rs01/reserve-room/
npm update

## アプリ起動・停止

/opt/rs01/reserve-room/app_startup.sh
/opt/rs01/reserve-room/app_shutdown.sh
