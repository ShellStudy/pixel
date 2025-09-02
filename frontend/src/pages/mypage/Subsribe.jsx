import { useState, useEffect } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { FastAPI } from '@utils/Network.js'
import { useNavigate } from "react-router-dom";

const Subsribe = ({setSubsribe}) => {
  const { isStorage, getFile, getUserNo } = useRoot()
  const [list, setList] = useState([])
  const navigate = useNavigate();
  useEffect(() => {
    if(isStorage("access")) {
      FastAPI("POST", `/subsribe/${getUserNo()}`, {})
      .then(res => {
        if(res.status) {
          setList(res.result)
        } 
      })
    } else {
      navigate("/");
    }
  }, [])
  return (
    <div className="modal-overlay" id="modalOverlay">
      <div className="overlay" onClick={()=>setSubsribe(false)}></div>
      <div className="modal">
        <h2>구독 목록</h2>
        <ul>
          {list?.map((row, index) => {
            return (
              <li key={index} onClick={()=>location.href = `/profile/media?no=${row.no}`} style={{cursor: 'pointer'}}>
                <img src={getFile(row.fileNo)} alt="사용자 A" />
                <span>{row.name}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default Subsribe