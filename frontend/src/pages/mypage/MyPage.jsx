import { useState, useEffect } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { useNavigate, Routes, Route } from "react-router-dom";
import NonePage from '@pages/component/NonePage.jsx'
import FreeView from '@pages/component/FreeView.jsx'
import Media from '@pages/mypage/Media.jsx'
import Like from '@pages/mypage/Like.jsx'
import Subsribe from '@pages/mypage/Subsribe.jsx'
import { FastAPI } from '@utils/Network.js'
import None from '@assets/none.png'

const MyPage = () => {
  const { isStorage, getFile, getUserNo, isFreeView } = useRoot()
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: '', name: '' })
  const [image, setImage] = useState(None);
  const [page, setPage] = useState("/")
  const [subsribe, setSubsribe] = useState(false)
  
  const getPage = (path) => {
    setPage(path)
    navigate(path)
  }
  useEffect(() => {
    if(isStorage("access")) {
      setPage(location.pathname)
      FastAPI("POST", '/info', {})
      .then(res => {
        if(res.status) {
          setUser(res.result)
          setImage(getFile(res.result.fileNo))
        } else {
          // 해당 사용자가 없을 경우 처리
        }
      })
    } else {
      navigate("/");
    }
  }, [])
  return (
    <>
    <main className="main-content">
      <div className="profile-header">
        <img src={image} alt="프로필 이미지" />
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p>팔로잉 {user.subscribeCount}명</p>
          <div className="profile-actions">
            <button type='button' className="follow-btn" onClick={()=>{setSubsribe(true)}}>구독 목록</button>
          </div>
        </div>
      </div>

      <div className="tabs">
        <div className={page == "/mypage/media" ? "tab active" : "tab"} onClick={()=>getPage("/mypage/media")}>Create Media</div>
        <div className={page == "/mypage/like" ? "tab active" : "tab"} onClick={()=>getPage("/mypage/like")}>Like</div>
      </div>
      <Routes>
        <Route path='/media' element={<Media />} />
        <Route path='/like' element={<Like />} />
        <Route path='/*' element={<NonePage />} />
      </Routes>      
    </main>
    {subsribe && <Subsribe setSubsribe={setSubsribe} />}

    {isFreeView && <FreeView />}
  </>
  )
}

export default MyPage