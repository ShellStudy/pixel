import { useState, useEffect } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { FastAPI } from '@utils/Network.js'
import { useLocation, useNavigate } from "react-router-dom";
import None from '@assets/none.png'

const Community = () => {
  const { access, getFile, getBoardFile } = useRoot()
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState([])
  const [page, setPage] = useState(0)
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const pageEvent = (type) => {
    if(type === "prev") {
      if(page > 0) setPage(page - 1)
    } 
    else if(type === "next") {
      if(page < pagination.size - 1) setPage(page + 1)
    }
    getData(page, "")
  }

  const submitEvent = (e) => {
    e.preventDefault()
    getData(page , e.target.q.value)
  }

  const getData = (p_page, q) => {
    FastAPI("POST", "/community", {"page" : p_page, "q": q})
    .then(res => {
      if(res.status) {
        setList(res.result.list)
        setPagination(res.result.pagination)
        if(res.result.pagination.size <= p_page) {
          navigate("/community")
        }
      }
    })
  }
  
  useEffect(() => {
    let p_page = queryParams.get("page")
    p_page = p_page === null ? 0 : Number(queryParams.get("page")) - 1
    setPage(p_page)
    getData(p_page, "")    
  }, [])
  return (
    <main className="main-content">
      <div className="content-wrapper">
        <header className="page-header">
          <h2>🗨️Community</h2>
          <form className="search" onSubmit={submitEvent}>
            <input type="search" name="q" placeholder="게시물 검색" aria-label="검색" />
            <button type="submit" className="search-btn" aria-label="검색">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            </button>
          </form>
        </header>

        <div className="post-area">
          
          <div className="post-pages">
            {
              list?.map((row, index) => {
                return (
                  <section className="post-list page" key={index}>
                    <article className="post-card">
                      <a className="post-avatar" href={`/profile/media?no=${row.regUserNo}`} aria-label="프로필">
                        <img src={getFile(row.fileNo)} alt="프로필 이미지" />
                      </a>
                      <div className="post-main">
                        <h3 className="post-author">{row.name}</h3>
                        <p className="post-text">{row.txt}</p>
                      </div>
                      <a className="post-thumb" href={`/freeView/${row.boardNo}`}>
                        <img src={getBoardFile(row.attachPath)} alt="썸네일" />
                      </a>
                    </article>
                  </section>
                )
              })
            }
          </div>
          {
            list.length > 0 &&
            <nav className="pagination" aria-label="페이지 이동">
              <button className={page === 0 ? 'page-btn prev is-disabled' : 'page-btn prev'} onClick={()=>pageEvent("prev")}>
                <i className="fa-solid fa-angle-left"></i>
              </button>

              {
                Array.from({ length: pagination.size }, (_, index) => 
                  (
                    <a className={page === index ? "page-num active" : "page-num"} key={index} href={`/community?page=${index+1}`} >{index + 1}</a>
                  )
                )
              }

              <button className={pagination.size - 1 === page ? 'page-btn next is-disabled' : 'page-btn next'} onClick={()=>pageEvent("next")}>
                <i className="fa-solid fa-angle-right"></i>
              </button>
            </nav>
          }

        </div>
      </div>
    </main>
  )
}

export default Community