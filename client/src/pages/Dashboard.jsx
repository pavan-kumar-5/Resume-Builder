import {
  FilePenIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloud,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'

const Dashboard = () => {

  const {user, token} =useSelector(state => state.auth)
  const colors = ['#9333ea', '#d97706', '#dc2626', '#0284c7', '#16a34a']

  const [allResumes, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')

  const [isLoading, setIsLoading]=useState(false)
  const navigate = useNavigate()

  const loadAllResumes = async () => {
    try {
      const {data} = await api.get('/api/users/resumes', {headers: {Authorization:token}});
      setAllResumes(data.resumes || [])
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const createResume = async (event) => {
    try {
      event.preventDefault()
      const {data} = await api.post('/api/resumes/create', {title})
      setTitle('')
      setShowCreateResume(false)
      // Reload resumes to get the latest list
      await loadAllResumes()
      navigate(`/app/builder/${data.resume._id}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const uploadResume = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const resumeText = await pdfToText(resume)
      const {data} = await api.post('/api/ai/upload-resume', {title, resumeText}, {headers: {Authorization:token}})
      setTitle('')
      setResume(null)
      setShowUploadResume(false)
      // Reload resumes to get the latest list
      await loadAllResumes()
      navigate(`/app/builder/${data.resumeId}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  const editTitle = async (event) => {
    try {
      event.preventDefault()
      const { data } = await api.put(
        `/api/resumes/update`,
        { resumeId: editResumeId, resumeData: { title } },
        { headers: { Authorization: token } }
      )
      // Optimistically update the local list with the returned resume title
      const updatedResume = data?.resume
      if (updatedResume) {
        setAllResumes((prev) =>
          prev.map((res) => res._id === updatedResume._id ? updatedResume : res)
        )
      } else {
        // fallback if API response shape changes
        setAllResumes((prev) =>
          prev.map((res) => res._id === editResumeId ? { ...res, title } : res)
        )
      }
      setTitle('')
      setEditResumeId('')
      toast.success('Title updated successfully')
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const deleteResume = async (resumeId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this resume?')
    if (confirmDelete) {
      try {
        await api.delete(`/api/resumes/delete/${resumeId}`)
        // Reload resumes to get the latest list
        await loadAllResumes()
        toast.success("Resume deleted successfully");
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message)
      }
    }
  }

  useEffect(() => {
    loadAllResumes()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome */}
      <p className="text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden">
        Welcome, {user?.name}
      </p>

      {/* Top Buttons */}
      <div className="flex gap-4 flex-wrap mb-6">
        {/* Create Resume */}
        <button
          onClick={() => setShowCreateResume(true)}
          className="w-full sm:max-w-36 h-48 bg-white flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer px-6"
        >
          <PlusIcon className="size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-600 text-white rounded-full" />
          <p className="text-sm group-hover:text-indigo-600 transition-all duration-300">
            Create Resume
          </p>
        </button>

        {/* Upload Resume */}
        <button
          onClick={() => setShowUploadResume(true)}
          className="w-full sm:max-w-36 h-48 bg-white flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer px-6"
        >
          <UploadCloudIcon className="size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full" />
          <p className="text-sm group-hover:text-purple-600 transition-all duration-300">
            Upload Resume
          </p>
        </button>
      </div>

      {/* Divider */}
      <hr className="border-slate-300 mb-6 w-[312px]" />

      {/* Resume List */}
      <div className="flex flex-wrap gap-4">
        {allResumes.length === 0 ? (
          <p className="text-slate-500 text-sm">No resumes yet. Create or upload one to get started!</p>
        ) : (
          allResumes.map((resume, index) => {
          const baseColor = colors[index % colors.length]

          return (
            <button
              key={resume._id}
              onClick={() => navigate(`/app/builder/${resume._id}`)}
              className="w-full sm:max-w-36 h-48 relative bg-white flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer px-6"
              style={{
                background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`,
                borderColor: `${baseColor}40`,
              }}
            >
              <FilePenIcon
                className="size-7 group-hover:scale-105 transition-all"
                style={{ color: baseColor }}
              />
              <p
                className="text-sm group-hover:scale-105 transition-all px-2 text-center"
                style={{ color: baseColor }}
              >
                {resume.title}
              </p>
              <p
                className="absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center"
                style={{ color: `${baseColor}90` }}
              >
                Updated on {new Date(resume.updatedAt).toLocaleDateString()}
              </p>

              {/* Edit / Delete icons */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-1 right-1 group-hover:flex items-center hidden"
              >
                <TrashIcon
                  onClick={() => deleteResume(resume._id)}
                  className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"
                />
                <PencilIcon
                  onClick={() => {
                    setEditResumeId(resume._id)
                    setTitle(resume.title)
                  }}
                  className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"
                />
              </div>
            </button>
          )
        })
        )}
      </div>

      {/* Modals Section */}
      <div>
        {/* Create Resume Modal */}
        {showCreateResume && (
          <form
            onSubmit={createResume}
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreateResume(false) }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-lg font-semibold mb-3">Create a Resume</h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-600"
                required
              />
              <button className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                Create Resume
              </button>
              <XIcon
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setShowCreateResume(false)
                  setTitle('')
                }}
              />
            </div>
          </form>
        )}

        {/* Upload Resume Modal */}
        {showUploadResume && (
          <form
            onSubmit={uploadResume}
            onClick={(e) => { if (e.target === e.currentTarget) setShowUploadResume(false) }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-lg font-semibold mb-3">Upload Resume</h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-600"
                required
              />
              <div>
                <label htmlFor="resume-input" className="block text-sm text-slate-700">
                  Select resume file
                  <div className="flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-green-500 hover:text-green-700 cursor-pointer transition-colors">
                    {resume ? (
                      <p className="text-green-700">{resume.name}</p>
                    ) : (
                      <>
                        <UploadCloud className="size-14 stroke-1" />
                        <p>Upload resume</p>
                      </>
                    )}
                  </div>
                </label>
                <input
                  type="file"
                  id="resume-input"
                  accept=".pdf"
                  hidden
                  onChange={(e) => setResume(e.target.files[0])}
                />
              </div>
              <button disabled={isLoading} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                {isLoading && <LoaderCircleIcon className="size-4 animate-spin text-white" />}
                {isLoading ? 'Uploading...' : 'Upload Resume'}
              </button>
              <XIcon
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setShowUploadResume(false)
                  setTitle('')
                  setResume(null)
                }}
              />
            </div>
          </form>
        )}

        {/* Edit Resume Modal */}
        {editResumeId && (
          <form
            onSubmit={editTitle}
            onClick={(e) => { if (e.target === e.currentTarget) setEditResumeId('') }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-lg font-semibold mb-3">Edit Resume Title</h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter new title"
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-600"
                required
              />
              <button className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                Update
              </button>
              <XIcon
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setEditResumeId('')
                  setTitle('')
                }}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Dashboard
