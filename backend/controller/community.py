from fastapi import APIRouter
from pydantic import BaseModel
from config.db import getConn
import mariadb

route = APIRouter(tags=["커뮤니티"])

class Community(BaseModel):
  page : int
  q : str
  
class Comment(BaseModel):
  boardNo: int 
  regUserNo: int
  txt: str

@route.post("/community")
def community(community : Community):
  try:
    conn = getConn()
    cur = conn.cursor()
    step = 5
    start = community.page * step
    sql = f'''
          SELECT c.`no` AS commentNo, c.`txt`, c.`regUserNo`, c.`boardNo`, f.attachPath, u.`name`, u.`fileNo`
            FROM pixel.`comment` AS c
          INNER JOIN pixel.`board` AS b
            ON (c.boardNo = b.`no` AND b.useYn = 'Y')
          INNER JOIN auth.`file` AS f
            ON (b.fileNo = f.`no` AND f.useYn = 'Y')
          INNER JOIN auth.`user` AS u
            ON (b.regUserNo = u.`no` AND u.useYn = 'Y')
          WHERE c.useYn = 'Y'
            AND c.txt like '%{community.q}%'
          ORDER BY c.`no` DESC
          LIMIT {start}, {step}
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    result1 = [dict(zip(columns, row)) for row in rows]
    sql = f'''
          SELECT COUNT(*) AS total, CEILING(COUNT(*) / {step}) AS size FROM pixel.`comment`
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    row = cur.fetchone()
    result2 = dict(zip(columns, row)) if row else None
    result = {"list": result1, "pagination": result2}
    cur.close()
    conn.close()
    return {"status": True, "result" : result}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
  
@route.post("/community/{boardNo}")
def community(boardNo: int):
  try:
    conn = getConn()
    cur = conn.cursor()
    sql = f'''
          SELECT c.`no` AS commentNo, c.`txt`, c.`regUserNo`, u.`name`, u.fileNo, c.`boardNo`
            FROM pixel.`comment` AS c
            INNER JOIN auth.`user` AS u
              ON (c.regUserNo = u.`no` AND u.useYn = 'Y')
          WHERE c.useYn = 'Y'
            AND c.boardNo = {boardNo}
          ORDER BY c.`no` DESC
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    result = [dict(zip(columns, row)) for row in rows]
    cur.close()
    conn.close()
    return {"status": True, "result" : result}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
  
@route.put("/community")
def community(comment: Comment):
  try:
    conn = getConn()
    cur = conn.cursor()
    txt = comment.txt.replace("\'", "\"")
    sql = f'''
          INSERT INTO pixel.`comment` 
            (boardNo, txt, useYn, regUserNo) 
          VALUE 
            ({comment.boardNo}, '{txt}', 'Y', {comment.regUserNo})
    '''
    cur.execute(sql)
    conn.commit()
    
    sql = f'''
          SELECT c.`no` AS commentNo, c.`txt`, c.`regUserNo`, u.`name`, u.fileNo, c.`boardNo`
            FROM pixel.`comment` AS c
            INNER JOIN auth.`user` AS u
              ON (c.regUserNo = u.`no` AND u.useYn = 'Y')
          WHERE c.useYn = 'Y'
            AND c.boardNo = {comment.boardNo}
          ORDER BY c.`no` DESC
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    result = [dict(zip(columns, row)) for row in rows]
    
    cur.close()
    conn.close()
    return {"status": True, "result": result}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
