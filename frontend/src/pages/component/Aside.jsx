import { useState, useEffect } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'

const Aside = () => {
  const { access, modalEvent, removeStorage } = useRoot()
  const [page, setPage] = useState(null)
  const navigate = (url) => location.href = url;
  const style = {cursor: 'pointer'};
  useEffect(() => {
    setPage(location.pathname)
  }, [page])
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {/* <i style={{backgroundImage: 'url(/Pixel_Symbol.png)', width: '20px', height: '20px'}}></i> */}
        <img src="/Pixel_Symbol.png" style={{width: '48px'}} />
        <h1 onClick={()=>navigate('/')} style={style}>Gen AI</h1>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={page === "/" ? "active" : ""}>
            <a href="/"><i className="fas fa-compass"></i> Explore</a>
          </li>
          <li className={page === "/community" ? "active" : ""}>
            <a href="/community"><i className="fas fa-comments"></i>Community</a>
          </li>
          {access &&
          <li className={page === "/mypage/media" || page === "/mypage/like" ? "active" : ""}>
            <a href="/mypage/media"><i className="fas fa-user"></i> My Page</a>
          </li>}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {access && <>
          <button type='button' className="theme-toggle" onClick={()=> modalEvent("User")}>Info</button>
          <button type='button' className="theme-toggle" onClick={()=> removeStorage("access")}>Logout</button>
        </>}
        {!access && <>
          <button type='button' className="theme-toggle" onClick={()=> modalEvent("Login")}>Login</button>
          <button type='button' className="theme-toggle" onClick={()=> modalEvent("SignUp")}>Sign Up</button>
        </>}
      </div>
    </aside>
  )
}

export default Aside