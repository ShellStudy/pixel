from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import mariadb
import os
from pydantic import BaseModel
import json
from urllib import request
import asyncio
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class Prompt(BaseModel):
  p : str
  no : int

class User(BaseModel):
  email: str
  
class Test(BaseModel):
  code: int
  
class Like(BaseModel):
  boardNo : int
  userNo : int

class Subsribe(BaseModel):
  sNo : int
  uNo : int

origins = [os.getenv('FRONT_HOST1'),os.getenv('FRONT_HOST2')]
COMFYUI_URL = os.getenv('COMFYUI_URL')

conn_params = {
  "user" : os.getenv('MARIADB_USER'),
  "password" : os.getenv('MARIADB_PASSWORD'),
  "host" : os.getenv('MARIADB_HOST'),
  "database" : "auth",
  "port" : int(os.getenv('MARIADB_PORT'))
}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
static_dir = os.path.join(os.path.dirname(__file__), "images")
app.mount("/images", StaticFiles(directory=static_dir), name="images")

@app.get("/")
def home():
  return {"status": 1}

@app.post("/community")
def community():
  conn = mariadb.connect(**conn_params)
  cur = conn.cursor()
  sql = '''
        SELECT c.`no` AS commentNo, c.`txt`, c.`regUserNo`, c.`boardNo`, u.`name` 
          FROM pixel.`comment` AS c
        INNER JOIN pixel.`board` AS b
            ON (c.boardNo = b.`no` AND b.useYn = 'Y')
        INNER JOIN auth.`user` AS u
            ON (b.regUserNo = u.`no` AND u.useYn = 'Y')
        WHERE c.useYn = 'Y'
        ORDER BY c.`no` desc
        
  '''
  cur.execute(sql)
  columns = [desc[0] for desc in cur.description]
  rows = cur.fetchall()
  result = [dict(zip(columns, row)) for row in rows]
  cur.close()
  conn.close()
  if result:
    return {
      "status": True,
      "result" : result
    }
  else :
    return {
      "status": False
    }
    
@app.post("/board")
def boards():
  conn = mariadb.connect(**conn_params)
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
  result = [dict(zip(columns, row)) for row in rows]
  cur.close()
  conn.close()
  if result:
    return {
      "status": True,
      "result" : result
    }
  else :
    return {
      "status": False
    }
    
@app.post("/board/{no}")
def board(no: int):
  conn = mariadb.connect(**conn_params)
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
  result = [dict(zip(columns, row)) for row in rows]
  cur.close()
  conn.close()
  if result:
    return {
      "status": True,
      "result" : result
    }
  else :
    return {
      "status": False
    }
    
@app.post("/subsribe/{no}")
def subsribe(no: int):
  conn = mariadb.connect(**conn_params)
  cur = conn.cursor()
  sql = f'''
        SELECT u.no, u.name, u.fileNo
          FROM pixel.`subscribe` AS s
        INNER JOIN auth.`user` AS u
            ON (s.userNo = u.no AND u.useYn = 'Y')
          WHERE s.useYn = 'Y'
          AND s.regUserNo = {no}
        ORDER BY 1 DESC
  '''
  cur.execute(sql)
  columns = [desc[0] for desc in cur.description]
  rows = cur.fetchall()
  result = [dict(zip(columns, row)) for row in rows]
  cur.close()
  conn.close()
  if result:
    return {
      "status": True,
      "result" : result
    }
  else :
    return {
      "status": False
    }
    
@app.put("/subsribe/{s}")
def subsribe(s: int, subsribe : Subsribe):
  try:
    conn = mariadb.connect(**conn_params)
    cur = conn.cursor()
    sql = None
    if s == 1:
      sql = f'''
            SELECT `no`, userNo, regUserNo, useYn
              FROM pixel.`subscribe` 
            WHERE userNo = {subsribe.sNo}
              AND regUserNo = {subsribe.uNo}
      '''
      cur.execute(sql)
      columns = [desc[0] for desc in cur.description]
      row = cur.fetchone()
      result = dict(zip(columns, row)) if row else None
      
      if result:
        sql = f'''
            UPDATE pixel.`subscribe` SET useYn = 'Y' WHERE userNo = {subsribe.sNo} AND regUserNo = {subsribe.uNo}
        '''
      else :
        sql = f'''
            INSERT INTO pixel.`subscribe` 
            (userNo, useYn, regUserNo) 
            VALUE 
            ({subsribe.sNo}, 'Y', {subsribe.uNo})
        '''
    else :
      sql = f'''
        UPDATE pixel.`subscribe` SET useYn = 'N' WHERE userNo = {subsribe.sNo} AND regUserNo = {subsribe.uNo}
      '''
    cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    return {
      "status": True
    }
  except mariadb.Error as e:
    print(f"MariaDB 오류 발생: {e}")
    return {
      "status": False
    }
    
@app.post("/info/{no}")
def info(no: int):
  conn = mariadb.connect(**conn_params)
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
  result = dict(zip(columns, row)) if row else None
  
  cur.close()
  conn.close()
  if result:
    return {
      "status": True,
      "result" : result
    }
  else :
    return {
      "status": False
    }
    
@app.post("/profile")
def profile(subsribe : Subsribe):
  conn = mariadb.connect(**conn_params)
  cur = conn.cursor()
  sql = f'''
        SELECT u.no, u.name, u.fileNo, COUNT(s.no) AS subscribeCount
          FROM auth.`user` u
          LEFT JOIN pixel.`subscribe` s
            ON s.regUserNo = u.no AND s.useYn = 'Y'
        WHERE u.useYn = 'Y'
          AND u.no = {subsribe.sNo}
        GROUP BY u.no, u.name, u.fileNo
  '''
  cur.execute(sql)
  columns = [desc[0] for desc in cur.description]
  row = cur.fetchone()
  result1 = dict(zip(columns, row)) if row else None
  
  result2 = None
  if subsribe.uNo > 0:
    sql = f'''
          SELECT `no`, userNo, regUserNo, useYn
            FROM pixel.`subscribe` 
          WHERE userNo = {subsribe.sNo}
            AND regUserNo = {subsribe.uNo}
    '''
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    row = cur.fetchone()
    result2 = dict(zip(columns, row)) if row else None
  
  cur.close()
  conn.close()
  if result1:
    return {
      "status": True,
      "result" : result1,
      "subscribe" : result2
    }
  else :
    return {
      "status": False
    }

@app.post("/gen")
async def comfyUI(prompt : Prompt):
  try:  
    # p = "a majestic lion with a crown of stars, photorealistic"
    with open("flow/1.json", "r", encoding="utf-8") as f:
      workflow = json.load(f)
    workflow["6"]["inputs"]["text"] = prompt.p

    prompt_id = queue_prompt(workflow)
    result = await check_progress(prompt_id)
    
    final_image_url = None
    origin_name = None
    file_name = None
    file_path = None
    now = datetime.now()
    formatted_date = now.strftime("%Y%m%d")
    path = f"images/{formatted_date}"
    if not os.path.exists(path):
      os.makedirs(path)
    for node_id, node_output in result['outputs'].items():
      if 'images' in node_output:
        for image in node_output['images']:
          final_image_url = f"http://{COMFYUI_URL}/api/view?filename={image['filename']}&type=output&subfolder="
          origin_name = image['filename'].replace(".png", "")
          file_name = uuid.uuid1().hex
          file_path = f"{path}/{file_name}.png"
          request.urlretrieve(final_image_url, file_path)
    
    if final_image_url:
      if file_name:
        conn = mariadb.connect(**conn_params)
        cur = conn.cursor()
        sql = f'''
              INSERT INTO auth.file 
              (`origin`, `name`, `ext`, `mediaType`, `attachPath`, `useYn`, `regUserNo`) 
              VALUE 
              ('{origin_name}', '{file_name}', '.png', 'image/png', '{file_path}', 'Y', {prompt.no})
        '''
        cur.execute(sql)
        conn.commit()
        last_id = cur.lastrowid
        print(last_id)
        
        sql = f'''
              INSERT INTO pixel.`board`
              (`prompt`, `fileNo`, `useYn`, `regUserNo`) 
              VALUE 
              ('{prompt.p}', {last_id}, 'Y', {prompt.no})
        '''
        cur.execute(sql)
        
        conn.commit()
        cur.close()
        conn.close()
        return {"status": True}
    else:
      return {"status": False}
  except HTTPException as e:
    raise e
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

def queue_prompt(prompt_workflow):
  p = {"prompt": prompt_workflow}
  data = json.dumps(p).encode('utf-8')
  req = request.Request(f"http://{COMFYUI_URL}/prompt", data=data)
  try:
    res = request.urlopen(req)
    if res.code != 200:
      raise Exception(f"Error: {res.code} {res.reason}")
    return json.loads(res.read().decode('utf-8'))['prompt_id']
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

async def check_progress(prompt_id: str):
  while True:
    try:
      req = request.Request(f"http://{COMFYUI_URL}/history/{prompt_id}")
      res = request.urlopen(req)
      if res.code == 200:
        history = json.loads(res.read().decode('utf-8'))
        if prompt_id in history:
          return history[prompt_id]
    except Exception as e:
      print(f"Error checking progress: {str(e)}")
    await asyncio.sleep(1)

@app.post("/like/{userNo}")
def like(userNo : int):
  conn = mariadb.connect(**conn_params)
  cur = conn.cursor()
  sql = f'''
        SELECT l.`no` AS likeNo, l.userNo AS likeUserNo, 
              b.no, b.prompt, f.attachPath, u.`name`, u.no, u.fileNo AS userFileNo
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
  result = [dict(zip(columns, row)) for row in rows]
  cur.close()
  conn.close()
  if result:
    return {"status": True, "result": result}
  else:
    return {"status": False}

@app.post("/like")
def boardLike(like : Like):
  try:
    conn = mariadb.connect(**conn_params)
    cur = conn.cursor()
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