import { useState, useEffect, useRef } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { useNavigate, useLocation } from "react-router-dom";
import { FastAPI } from '@utils/Network.js'

const Like = () => {
  const { isStorage, getBoardFile, getUserNo, targetImage } = useRoot()
  const navigate = useNavigate();
  const [list, setList] = useState([])
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  useEffect(() => {
    FastAPI("POST", `/like/${queryParams.get("no")}`)
    .then(res => {
      if(res.status) {
        console.log(res.result)
        setList(res.result)
      }
    })
  }, [])
  return (
    <>
    <div className="grid">
      {list?.map((row, index) => {
        return (
          <div className="grid-card" key={index} onClick={()=>targetImage(row)}>
            <img src={getBoardFile(row.attachPath)} alt="" />
          </div>
        )
      })}
    </div>
    {list.length === 0 &&
      <div className="empty-state">
        <h1>아직 텅 빈 공간이에요.</h1>
        <p><strong>Explore </strong>에서 마음에 드는 생성물에<strong> Like</strong>를 눌러<br/> 이미지를 보관해보세요!</p>
      </div>
    }
    </>
  )
}

export default Like