import { useState, useEffect } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import NonePage from '@pages/component/NonePage.jsx'
import Media from '@pages/profile/Media.jsx'
import Like from '@pages/profile/Like.jsx'
import { FastAPI } from '@utils/Network.js'
import '@styles/mypage/mypage.css'
import None from '@assets/none.png'

const UserPage = () => {
  const { isStorage, getFile, getUserNo, modalEvent } = useRoot()
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: '', name: '' })
  const [image, setImage] = useState(None);
  const [page, setPage] = useState("/")
  const [isSubsribe, setIsSubsribe] = useState(false)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const getPage = (path) => {
    setPage(path)
    navigate(`${path}?no=${queryParams.get("no")}`)
  }
  const subsribeEvent = (status) => {    
    if(isStorage("access")) {
      FastAPI("PUT", `/subsribe/${status}`, {sNo: queryParams.get("no"), uNo: getUserNo()})
      .then(res => {
        if(res.status){
          setIsSubsribe(status === 1)
        }
      })
    } else {
      modalEvent("Login")
    }
  }
  useEffect(() => {
    setPage(location.pathname)
    FastAPI("POST", `/profile`, {sNo: queryParams.get("no"), uNo: getUserNo()})
    .then(res => {
      if(res.status) {
        setUser(res.result)
        setImage(getFile(res.result.fileNo))
        if(res.subscribe) {
          setIsSubsribe(res.subscribe.useYn === 'Y')
        } else {
          setIsSubsribe(false)
        }
      }
    })
  }, [])
  return (
    <main className="main-content">
      <div className="profile-header">
        <img src={image} alt="프로필 이미지" />
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p>팔로잉 {user.subscribeCount}명</p>
          <div className="profile-actions">
            {
            isSubsribe ? 
            <button type='button' className="follow-revoke-btn" onClick={()=>subsribeEvent(0)}>구독 취소</button>
            :
            <button type='button' className="follow-btn" onClick={()=>subsribeEvent(1)}>구독</button>
            }
          </div>
        </div>
      </div>

      <div className="tabs">
        <div className={page == "/profile/media" ? "tab active" : "tab"} onClick={()=>getPage("/profile/media")}>Create Media</div>
        <div className={page == "/profile/like" ? "tab active" : "tab"} onClick={()=>getPage("/profile/like")}>Like</div>
      </div>
      <Routes>
        <Route path='/media' element={<Media />} />
        <Route path='/like' element={<Like />} />
        <Route path='/*' element={<NonePage />} />
      </Routes>      
    </main>
  )
}

export default UserPage