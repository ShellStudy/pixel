from fastapi import APIRouter
from pydantic import BaseModel
from config.db import getConn
import mariadb

route = APIRouter(tags=["좋아요"])

class Like(BaseModel):
  status: int
  likeNo: int
  boardNo : int
  userNo : int

@route.post("/like/{userNo}")
def like(userNo : int):
  try:
    conn = getConn()
    cur = conn.cursor()
    sql = f'''
          SELECT l.`no` AS likeNo, l.userNo AS likeUserNo, 
                b.no as boardNo, b.prompt, f.attachPath, u.`name`, u.no, u.fileNo AS userFileNo
          FROM pixel.`like` AS l
          INNER JOIN pixel.`board` AS b
          ON (b.no = l.boardNo AND b.useYn = 'Y')
          INNER JOIN auth.`file` AS f
          ON (b.fileNo = f.`no` AND f.useYn = 'Y')
          INNER JOIN auth.`user` AS u
          ON (b.regUserNo = u.no AND u.useYn = 'Y')
          WHERE l.useYn = 'Y'
            AND l.userNo = {userNo}
          ORDER BY l.boardNo DESC
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    cur.close()
    conn.close()
    result = [dict(zip(columns, row)) for row in rows]
    return {"status": True, "result": result}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}

@route.post("/like")
def boardLike(like : Like):
  try:
    conn = getConn()
    cur = conn.cursor()
    
    if like.status == 1 :
      sql = f'''
            UPDATE pixel.`like` SET useYn = 'N' WHERE boardNo= {like.boardNo} AND userNo = {like.userNo}
      '''
    else :
      if like.likeNo > 0:
        sql = f'''
            UPDATE pixel.`like` SET useYn = 'Y' WHERE boardNo= {like.boardNo} AND userNo = {like.userNo}
        '''
      else :
        sql = f'''
              INSERT INTO pixel.`like` 
              (boardNo, userNo, useYn, regUserNo) 
              VALUE 
              ({like.boardNo}, {like.userNo}, 'Y', {like.userNo})
        '''
    cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    return {"status": True}
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {"status": False}
