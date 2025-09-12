from fastapi import APIRouter, Depends
from pydantic import BaseModel
from config.db import getConn
from config.token import get_current
import mariadb

route = APIRouter(tags=["구독"])

class Subsribe(BaseModel):
  sNo : int

@route.post("/subsribe")
def subsribe(payload = Depends(get_current)):
  try:
    conn = getConn()
    cur = conn.cursor()
    sql = f'''
          SELECT u.no, u.name, u.fileNo
            FROM pixel.`subscribe` AS s
          INNER JOIN auth.`user` AS u
              ON (s.userNo = u.no AND u.useYn = 'Y')
            WHERE s.useYn = 'Y'
            AND s.regUserNo = {payload["userNo"]}
          ORDER BY 1 DESC
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
    
@route.put("/subsribe/{s}")
def subsribe(s: int, subsribe : Subsribe, payload = Depends(get_current)):
  try:
    conn = getConn()
    cur = conn.cursor()
    sql = None
    if s == 1:
      sql = f'''
            SELECT `no`, userNo, regUserNo, useYn
              FROM pixel.`subscribe` 
            WHERE userNo = {subsribe.sNo}
              AND regUserNo = {payload["userNo"]}
      '''
      cur.execute(sql)
      columns = [desc[0] for desc in cur.description]
      row = cur.fetchone()
      result = dict(zip(columns, row)) if row else None
      
      if result:
        sql = f'''
            UPDATE pixel.`subscribe` SET useYn = 'Y' WHERE userNo = {subsribe.sNo} AND regUserNo = {payload["userNo"]}
        '''
      else :
        sql = f'''
            INSERT INTO pixel.`subscribe` 
            (userNo, useYn, regUserNo) 
            VALUE 
            ({subsribe.sNo}, 'Y', {payload["userNo"]})
        '''
    else :
      sql = f'''
        UPDATE pixel.`subscribe` SET useYn = 'N' WHERE userNo = {subsribe.sNo} AND regUserNo = {payload["userNo"]}
      '''
    cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    return {"status": True}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
