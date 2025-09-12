from fastapi import APIRouter, Depends
from pydantic import BaseModel
from config.db import getConn
from config.token import get_current
import mariadb

route = APIRouter(tags=["게시판"])

@route.post("/board")
def findAll():
  try:
    conn = getConn()
    print(conn)
    cur = conn.cursor()
    sql = '''
          SELECT b.no, b.prompt, f.attachPath, u.`name`, u.no AS userNo, u.fileNo AS userFileNo, b.modDate
            FROM pixel.`board` AS b 
          INNER JOIN auth.`user` AS u
              ON (b.regUserNo = u.no AND u.useYn = 'Y')
          INNER JOIN auth.`file` AS f
              ON (b.fileNo = f.no AND f.useYn = 'Y')
          WHERE b.useYn = 'Y'
          ORDER BY 1 desc
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    cur.close()
    conn.close()
    result = None
    if rows:
      result = [dict(zip(columns, row)) for row in rows]
    else :
      result = []
    return {"status": True, "result" : result}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
    
@route.post("/board/{no}")
def board(no: int):
  try:
    conn = getConn()
    cur = conn.cursor()
    sql = f'''
          SELECT b.no as boardNo, b.prompt, f.attachPath, u.`name`, u.no, u.fileNo AS userFileNo
            FROM pixel.`board` AS b 
          INNER JOIN auth.`user` AS u
              ON (b.regUserNo = u.no AND u.useYn = 'Y') 
          INNER JOIN auth.`file` AS f
            ON (b.fileNo = f.`no` AND f.useYn = 'Y')
          WHERE b.useYn = 'Y'
          AND b.regUserNo = {no}
        ORDER BY 1 desc
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    cur.close()
    conn.close()
    result = [dict(zip(columns, row)) for row in rows]
    return {"status": True, "result" : result}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
  
@route.post("/board/freeview/{no}/{userNo}")
def freeview(no: int, userNo: int):
  try:
    conn = getConn()
    cur = conn.cursor()
    sql = f'''
          SELECT b.`no`, b.regUserNo, b.prompt, f.attachPath, u.`name`, u.no, u.fileNo AS userFileNo
          FROM pixel.`board` AS b 
        INNER JOIN auth.`user` AS u
            ON (b.regUserNo = u.no AND u.useYn = 'Y') 
        INNER JOIN auth.`file` AS f
          ON (b.fileNo = f.`no` AND f.useYn = 'Y')
        WHERE b.useYn = 'Y'
        AND b.`no` = {no}
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    row = cur.fetchone()
    result1 = dict(zip(columns, row)) if row else None
    
    sql = f'''
        SELECT 
          case 
            when COUNT(*) = 1 AND IFNULL(useYn, 'N') = 'Y' then 1
            ELSE 0
            end AS status, 
            IFNULL(`no`, 0) AS likeNo 
        FROM pixel.`like` 
        WHERE boardNo = {no} AND userNo = {userNo}
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    row = cur.fetchone()
    result2 = dict(zip(columns, row)) if row else None
        
    result3 = None
    if userNo > 0:
      sql = f'''
          SELECT s.`no`, s.userNo, s.regUserNo, s.useYn
            FROM pixel.`subscribe` AS s
          INNER JOIN pixel.`board` AS b
              ON (b.regUserNo = s.userNo AND b.useYn = 'Y' AND b.`no` = {no})
          WHERE s.regUserNo = {userNo}
      '''
      cur.execute(sql)
      columns = [desc[0] for desc in cur.description]
      row = cur.fetchone()
      result3 = dict(zip(columns, row)) if row else None
    
    result = {"board": result1, "like": result2, "subscribe": result3}
    cur.close()
    conn.close()
    return {"status": True, "result" : result}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
