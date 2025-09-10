import { useState, useEffect, useRef } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { FastAPI } from '@utils/Network.js'

const Root = () => {
  const { access, setAccess, modalEvent, isStorage, getBoardFile, isFreeView, setIsFreeView, getUserNo, targetImage } = useRoot()
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [ratio, setRatio] = useState('square')
  const [seed, setSeed] = useState(1)
  const [controlAfterGenerate, setControlAfterGenerate] = useState("randomize")
  const [step, setStep] = useState(1)
  const [cfg, setCFG] = useState(7)
  const [samplerName, setSamplerName] = useState('euler')
  const [scheduler, setScheduler] = useState('simple')
  const [denoise, setDenoise] = useState(1)
  const [model, setModel] = useState(0)
  const [settings, setSettings] = useState(false)
  
  const promptRef = useRef()

  const getBoards = () => {
    FastAPI("POST", "/board", {})
    .then(res => {
      if(res.status) {
        setImages(res.result)
        setAccess(isStorage("access"))
      } else {
        alert("이미지 목록 조회 중 네트워크 오류가 발생 했습니다.")
      }
    })
  }

  const isChecck = () => {
    if(!access) modalEvent("Login")
  }

  const applyEvent = () => {
    setIsLoading(true)
    if(promptRef.current.value === "") {
      promptRef.current.focus();
      setIsLoading(false)
      return;
    }

    const params = {
      no: getUserNo(),
      p: promptRef.current.value,
      ratio, seed, controlAfterGenerate,  samplerName, scheduler,
      "step": Number(step), "cfg": Number(cfg), "denoise": Number(denoise),
      "model": Number(model)
    }

    FastAPI("POST", "/gen", params)
    .then(res => {
      if(res.status){
        getBoards()
        promptRef.current.value = ""
      } else {
        alert("이미지 생성이 실패 하였습니다.")
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    getBoards()
  }, []);

  return (
    <>
    <main className={`main-content ${settings ? 'scrollLock' : ''}`}>
      <header className="prompt-section">
        <div className="prompt-input-wrapper" onClick={isChecck}>
          {/* <input type="text" ref={promptRef} placeholder="Imagine something... a futuristic city in the style of Van Gogh" /> */}
          <textarea style={{resize:'none'}} ref={promptRef} placeholder="Imagine something... a futuristic city in the style of Van Gogh"></textarea>
          {/* <button type='button' className="btn-generate" disabled={!access} onClick={applyEvent}>Generate</button> */}
          <div className="prompt-actions">
            <button id="settingsToggle" className="settings-btn" aria-haspopup="true" aria-expanded="false" title="Settings" onClick={()=>setSettings(!settings)}>⚙</button>
            <button className="btn-generate" disabled={!access} onClick={applyEvent}>Generate</button>
          </div>
        </div>
        {settings &&
          <div id="settingsPanel" className="settings-panel">
            
            <div className="setting-group image-size-group">
              <div className="setting-header">
                <span className="setting-title">Image Size</span>
                <span className="setting-desc">선호하는 이미지 비율을 선택하세요</span>
              </div>

              <div className="ratio-controls">
                
                <div className='ratio-group'>  
                  <input type="radio" name="ratio" id="ratioPortrait" onChange={()=>setRatio('portrait')} checked={ratio==="portrait"} />
                  <label htmlFor="ratioPortrait" className="pill">Portrait (512x768)</label>

                  <input type="radio" name="ratio" id="ratioSquare" onChange={()=>setRatio('square')} checked={ratio==="square"} />
                  <label htmlFor="ratioSquare" className="pill">Square (512x512)</label>

                  <input type="radio" name="ratio" id="ratioLandscape" onChange={()=>setRatio('landscape')} checked={ratio==="landscape"} />
                  <label htmlFor="ratioLandscape" className="pill">Landscape (768x512)</label>
                </div>

                <div className="image-preview">
                  {ratio === 'portrait' && <div className="preview-box portrait">2 : 3</div>}
                  {ratio === 'square' && <div className="preview-box square">1 : 1</div>}
                  {ratio === 'landscape' && <div className="preview-box landscape">3 : 2</div>}
                </div>
              </div>
            </div>

            <div className="setting-group comfy-group">
              <div className="setting-header">
                <span className="setting-title">K-Sampler</span>
                <span className="setting-desc">샘플링 관련 설정</span>
              </div>

              <div className="select-row">
                <span className="setting-desc">Seed</span>
                <input type="number" min="1" max="999999999" value={seed} onChange={(e)=>setSeed(e.target.value)} disabled={controlAfterGenerate !== 'fixed'} />
              </div>
              
              <div className="select-row">
                <span className="setting-desc">Control after generate</span>
                <select className="sampler-select" value={controlAfterGenerate} onChange={(e)=>{
                    const value = e.target.value;
                    if(value === 'randomize') setSeed(1)
                    setControlAfterGenerate(value);
                  }}>
                  <option value="randomize">Randomize</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>

              <div className="select-row">
                <span className="setting-desc">Step</span>
                <input type="number" min="1" max="30" value={step} onChange={(e)=>setStep(e.target.value)} />
              </div>

              <div className="select-row">
                <span className="setting-desc">CFG</span>
                <input type="number" min="1" max="20" value={cfg} onChange={(e)=>setCFG(e.target.value)} />
              </div>
              
              <div className="select-row">
                <span className="setting-desc">Sampler name</span>
                <select className="sampler-select" value={samplerName} onChange={(e)=>setSamplerName(e.target.value)}>
                  <option value="euler">Euler</option>
                  <option value="dpmpp_sde">DPM++ SDE</option>
                  <option value="dpmpp_2m">DPM++ 2M</option>
                </select>
              </div>

              <div className="select-row">
                <span className="setting-desc">Scheduler</span>
                <select className="sampler-select" value={scheduler} onChange={(e)=>setScheduler(e.target.value)}>
                  <option value="simple">Simple</option>
                  <option value="normal">Normal</option>
                  <option value="karras">Karras</option>
                </select>
              </div>

              <div className="select-row">
                <span className="setting-desc">Denoise</span>
                <input type="number" min="0.3" max="1" step="0.01" value={denoise} onChange={(e)=>setDenoise(e.target.value)} />
              </div>

            </div>

            <div className="setting-group comfy-group">
                <div className="setting-header">
                  <span className="setting-title">Checkpoint</span>
                  <span className="setting-desc">모델 선정</span>
                </div>

                <div className="select-row">
                  <span className="setting-desc">Model</span>
                  <select className="sampler-select" value={model} onChange={(e)=>setModel(e.target.value)}>
                    <option value="0">Model 1</option>
                    <option value="1">Model 2</option>
                    <option value="2">Model 3</option>
                    <option value="3">Model 4</option>
                    <option value="4">Model 5</option>
                  </select>
                </div>
              </div>

          </div>
        }
      </header>

      <section className="gallery">
        {isLoading &&
        <div className="loading-box-inline">
          {/* <button className="cancel-button" type="button">X 취소</button> */}
          <div className="spinner" aria-hidden="true"></div>
          <h2>잠시만요...</h2>
          <p>AI Gen이 이미지를 만들고 있어요.</p>
        </div>
        }
        { /* 이미지 반복 */
          images?.map((row, index) => {
            return (
              <div className="gallery-item" key={index} onClick={()=>location.href = `/freeView/${row.no}`}>
                <img src={getBoardFile(row.attachPath)} alt="AI generated image" />
                <div className="overlay">
                  <p className="prompt-text">{row.prompt}</p>
                </div>
            </div>
            )
          })
        }
      </section>
  </main>
  </>
  )
}

export default Root