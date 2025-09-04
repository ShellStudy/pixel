from fastapi import APIRouter
from pydantic import BaseModel
from config.db import getConn
import mariadb

route = APIRouter(tags=["게시판"])

@route.post("/board")
def boards():
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
          SELECT b.no, b.prompt, f.attachPath, u.`name`, u.no, u.fileNo AS userFileNo
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
