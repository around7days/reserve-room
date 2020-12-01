-- 会議室マスタ
-- drop table m_room;
create table if not exists m_room (
    room_id integer not null
    , room_nm text not null
    , sort integer
    , ins_date text
    , upd_date text
    , del_flg integer not null default 0
    , primary key(room_id)
);

-- 会議室予約情報
-- drop table t_room_reserve;
create table if not exists t_room_reserve (
    id integer primary key autoincrement
    , user_nm text
    , dept_nm text
    , reason text
    , room_id integer not null
    , start_time text not null
    , end_time text not null
    , password text
    , ins_date text
    , upd_date text
    , del_flg integer not null default 0
);

-- 会議室マスタ
delete from m_room;
insert into m_room values (1, '大会議室',   1, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
insert into m_room values (2, '中会議室',   2, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
insert into m_room values (3, '小会議室',   3, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
insert into m_room values (4, '応接室',     5, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
insert into m_room values (5, '商談ルーム', 4, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
select * from m_room;
