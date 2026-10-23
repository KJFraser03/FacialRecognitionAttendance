import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [attendanceData, setAttendanceData] = useState([])
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0 })
  const [isConnected, setIsConnected] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [latestId, setLatestId] = useState(null)

  // Registration Modal State
  const [showModal, setShowModal] = useState(false)
  const [regName, setRegName] = useState("")
  const [capturedImage, setCapturedImage] = useState(null)
  
  // Refs for Camera Handling
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null) // Store the stream to manage it properly

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Data Loop
  const fetchAttendance = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/attendance')
      const data = response.data.data
      
      if (data.length > 0 && attendanceData.length > 0) {
        if (data[0]._id !== attendanceData[0]._id) {
           setLatestId(data[0]._id)
           setTimeout(() => setLatestId(null), 3000)
        }
      }

      setAttendanceData(data)
      
      const presentCount = data.filter(r => r.status === 'Present').length
      const lateCount = data.filter(r => r.status === 'Late').length
      setStats({ total: data.length, present: presentCount, late: lateCount })
      
      setIsConnected(true)
    } catch (error) {
      console.error("Backend offline")
      setIsConnected(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
    const interval = setInterval(fetchAttendance, 2000)
    return () => clearInterval(interval)
  }, [attendanceData])

  // --- REGISTRATION LOGIC ---
  const startCamera = async () => {
    setShowModal(true)
    setCapturedImage(null)
    setRegName("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
      streamRef.current = stream // Save stream to ref
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      alert("Camera error. Please allow permissions.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      
      // Match the mirrored preview: Flip horizontally before drawing
      context.save() // Save default state
      context.translate(640, 0)
      context.scale(-1, 1)
      context.drawImage(videoRef.current, 0, 0, 640, 480)
      context.restore() // Restore to default state

      canvasRef.current.toBlob(blob => setCapturedImage(blob), 'image/jpeg', 0.95)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    // The video stream is still running in background, so we just show it again!
  }

  const saveStudent = async () => {
    if (!regName || !capturedImage) return alert("Please enter name and capture photo!")
    
    const formData = new FormData()
    formData.append('studentName', regName)
    formData.append('image', capturedImage, 'capture.jpg')

    try {
      await axios.post('http://localhost:5001/api/attendance/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert(`✅ ${regName} Registered Successfully!`)
      closeModal()
    } catch (error) {
      alert("❌ Registration Failed")
    }
  }

  const closeModal = () => {
    setShowModal(false)
    // Properly stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const downloadCSV = () => {
    const headers = ['Name,Date,Time,Status']
    const rows = attendanceData.map(r => `${r.name},${r.date},${r.time},${r.status}`)
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", "attendance.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status) => {
    if (status === 'Late') return 'late'
    return 'present'
  }

  return (
    <div className="dashboard">
      
      {/* HEADER */}
      <div className="header">
        <div>
          <div className="title">
            <h1>VISION<span style={{color:'white'}}>GUARD</span></h1>
          </div>
          <p className="subtitle">AI Attendance Command Center</p>
        </div>

        <div className="header-right">
          <div className="clock">
            <div className="clock-time">{currentTime.toLocaleTimeString()}</div>
            <div className="clock-date">{currentTime.toLocaleDateString()}</div>
          </div>
          
          <button className="btn-primary" style={{background: '#8b5cf6'}} onClick={startCamera}>
            <span>➕</span> Register Student
          </button>
          
          <button className="btn-primary" onClick={downloadCSV}>
            <span>⬇</span> Export
          </button>

          <div className="status-indicator" style={{ color: isConnected ? '#10b981' : '#ef4444', borderColor: isConnected ? '#10b981' : '#ef4444' }}>
            <div className="dot" style={{ backgroundColor: isConnected ? '#10b981' : '#ef4444' }}></div>
            {isConnected ? 'ACTIVE' : 'OFFLINE'}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="left-panel">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-title">Total Scans</span>
              <div className="stat-value" style={{ color: '#60a5fa' }}>{stats.total}</div>
            </div>
            <div className="stat-card">
              <span className="stat-title">Present</span>
              <div className="stat-value" style={{ color: '#34d399' }}>{stats.present}</div>
            </div>
            <div className="stat-card">
              <span className="stat-title">Late Arrivals</span>
              <div className="stat-value" style={{ color: '#fbbf24' }}>{stats.late}</div>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Date</th>
                  <th>Time In</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((record, index) => (
                    <tr key={record._id} style={{backgroundColor: record._id === latestId ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}}>
                      <td style={{opacity: 0.5, fontFamily: 'monospace'}}>#{index + 1}</td>
                      <td style={{fontWeight: 'bold', color: 'white'}}>{record.name}</td>
                      <td>{record.date}</td>
                      <td style={{fontFamily: 'monospace', color: '#60a5fa'}}>{record.time}</td>
                      <td>
                        <span className={`status-pill ${getStatusColor(record.status)}`}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{textAlign:'center', padding:'60px', opacity:0.5}}>Waiting for scans...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="right-panel">
          <div className="history-panel">
            <div className="panel-header">
              <h3>🚀 Live Activity</h3>
            </div>
            <div className="history-list">
              {attendanceData.slice(0, 8).map((record) => (
                <div key={record._id} className="history-item">
                  <div className="avatar">{record.name.charAt(0)}</div>
                  <div className="history-details">
                    <span className="history-name">{record.name}</span>
                    <span className="history-meta">Scanned at {record.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h2>Register New Student</h2></div>
            
            <div className="camera-section">
                <div className="camera-box">
                    {/* VIDEO: Always mounted, hidden when image captured */}
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        style={{ display: capturedImage ? 'none' : 'block' }} 
                    ></video>

                    {/* IMAGE: Shown only when captured */}
                    {capturedImage && (
                        <img src={URL.createObjectURL(capturedImage)} style={{ display: 'block' }} />
                    )}

                    {/* OVERLAY: Only on video */}
                    {!capturedImage && <div className="face-guide"></div>}

                    {/* Canvas for capturing (Always hidden) */}
                    <canvas ref={canvasRef} width="640" height="480" style={{display:'none'}}></canvas>
                </div>
                
                <div className="controls-sidebar">
                    <div className="input-group">
                        <label>Full Name & ID</label>
                        <input 
                            value={regName} 
                            onChange={(e) => setRegName(e.target.value)} 
                            placeholder="Ex: Kirby Laranjo (2020-001)" 
                            autoFocus
                        />
                    </div>
                    
                    <div style={{flex: 1}}></div>

                    {!capturedImage ? (
                        <button className="btn-primary btn-capture" onClick={capturePhoto}>
                             📷 Capture Photo
                        </button>
                    ) : (
                        <button className="btn-primary btn-capture" onClick={retakePhoto} style={{background:'#f59e0b'}}>
                             🔄 Retake
                        </button>
                    )}
                </div>
            </div>

            <div className="modal-actions">
              <button className="btn-primary btn-save" onClick={saveStudent}>Save to Database</button>
              <button className="btn-primary btn-close" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default App