-- 会議室マスタ
delete from m_room;
insert into m_room values (1, '大会議室',   1, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
insert into m_room values (2, '中会議室',   2, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
insert into m_room values (3, '小会議室',   3, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
insert into m_room values (4, '応接室',     5, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
insert into m_room values (5, '商談ルーム', 4, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);

