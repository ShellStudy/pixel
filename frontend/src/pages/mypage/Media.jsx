import { useState, useEffect, useRef } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { useNavigate } from "react-router-dom";
import { FastAPI } from '@utils/Network.js'

const Media = () => {
  const { isStorage, getBoardFile, getUserNo } = useRoot()
  const navigate = useNavigate();
  const [list, setList] = useState([])
  useEffect(() => {
    if(isStorage("access")) { 
      FastAPI("POST", `/board/${getUserNo()}`, {})
      .then(res => {
        if(res.status) {
          setList(res.result)
        } else {
          setList([])
        }
      })
    } else {
      navigate("/");
    }
  }, [])
  return (
    <>
      <div className="grid">
        {list?.map((row, index) => {
          return (
            <div className="grid-card" key={index} onClick={()=>navigate(`/freeView/${row.boardNo}`)}>
              <img src={getBoardFile(row.attachPath)} alt="" />
            </div>
          )
        })}
      </div>
      {list.length === 0 &&
        <div className="empty-state">
          <h1>아직 텅 빈 공간이에요.</h1>
          <p><strong>Explore</strong>에서 프롬프트를 작성하고 <strong>Generate</strong>를 눌러<br/> 이미지를 생성해 보세요!</p>
        </div>
      }
    </>
  )
}

export default Media