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

-- 会議室予約ビュー
-- drop view v_room_reserve;
create view if not exists v_room_reserve as 
select
  trr.id
  , trr.user_nm
  , trr.dept_nm
  , trr.reason
  , trr.room_id
  , mr.room_nm
  , datetime(trr.start_time) as start_time
  , datetime(trr.end_time) as end_time
  , datetime(trr.ins_date) as ins_date
  , datetime(trr.upd_date) as upd_date
from
  t_room_reserve trr 
  inner join m_room mr 
    on mr.room_id = trr.room_id 
    and mr.del_flg = 0 
where
  trr.del_flg = 0
;
