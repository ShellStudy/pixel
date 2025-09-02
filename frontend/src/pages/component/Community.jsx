import { useState, useEffect } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { FastAPI } from '@utils/Network.js'

const Community = () => {
  const { access } = useRoot()
  const [list, setList] = useState([])
  useEffect(() => {
    FastAPI("POST", "/community", {})
    .then(res => {
      if(res.status) {
        setList(res.result)
      }
    })
  }, [])
  return (
    <main className="main-content">
      <div className="content-wrapper">
        <header className="page-header">
          <h2>Community</h2>
        </header>

        <div className="post-list">
          {
            list?.map((row, index) => {
              return (
                <a href={"#view="+row.boardNo} className="post-preview" key={index}>
                  <h3>작성자 : {row.name}</h3>
                  <p>{row.txt}</p>
                </a>
              )
            })
          }
        </div>
      </div>
    </main>
  )
}

export default Community