from fastapi import APIRouter
from pydantic import BaseModel
from config.db import getConn
import mariadb

route = APIRouter(tags=["사용자"])

class User(BaseModel):
  email: str

class Profile(BaseModel):
  sNo : int
  uNo : int
  
@route.post("/info/{no}")
def info(no: int):
  try:
    conn = getConn()
    cur = conn.cursor()
    sql = f'''
          SELECT u.no, u.name, u.fileNo, COUNT(s.no) AS subscribeCount
            FROM auth.`user` u
            LEFT JOIN pixel.`subscribe` s
              ON s.regUserNo = u.no AND s.useYn = 'Y'
          WHERE u.useYn = 'Y'
            AND u.no = {no}
          GROUP BY u.no, u.name, u.fileNo
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    row = cur.fetchone()
    cur.close()
    conn.close()
    result = dict(zip(columns, row)) if row else None
    return {"status": True, "result" : result}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
    
@route.post("/profile")
def profile(profile : Profile):
  try:
    conn = getConn()
    cur = conn.cursor()
    sql = f'''
          SELECT u.no, u.name, u.fileNo, COUNT(s.no) AS subscribeCount
            FROM auth.`user` u
            LEFT JOIN pixel.`subscribe` s
              ON s.regUserNo = u.no AND s.useYn = 'Y'
          WHERE u.useYn = 'Y'
            AND u.no = {profile.sNo}
          GROUP BY u.no, u.name, u.fileNo
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    row = cur.fetchone()
    result1 = dict(zip(columns, row)) if row else None
    
    result2 = None
    if profile.uNo > 0:
      sql = f'''
            SELECT `no`, userNo, regUserNo, useYn
              FROM pixel.`subscribe` 
            WHERE userNo = {profile.sNo}
              AND regUserNo = {profile.uNo}
      '''
      cur.execute(sql)
      columns = [desc[0] for desc in cur.description]
      row = cur.fetchone()
      result2 = dict(zip(columns, row)) if row else None
    cur.close()
    conn.close()
    return {"status": True, "result" : result1, "subscribe" : result2}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
