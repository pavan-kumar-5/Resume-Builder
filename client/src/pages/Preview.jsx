import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ResumePreview from '../Components/ResumePreview'
import Loader from '../Components/Loader'
import api from '../configs/api'

const Preview = () => {
  const { resumeId } = useParams()
  const [resumeData, setResumeData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!resumeId) {
      setIsLoading(false)
      return
    }
    const loadResume = async () => {
      try {
        const { data } = await api.get('/api/resumes/public/'+ resumeId)
        if (data.resume) {
          setResumeData(data.resume)
          document.title = data.resume.title || 'Resume Preview'
        } else {
          setResumeData(null)
        }
      } catch (error) {
        console.log('Error loading resume:', error.message)
        setResumeData(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadResume()
  }, [resumeId])

  if (isLoading) return <Loader />

  if (!resumeData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-center text-4xl text-slate-400 font-medium">Resume not found</p>
        <a
          href="/"
          className="mt-6 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 h-9 m-1 ring-offset-1 ring-green-400 flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 size-4" />
          Go to Home Page
        </a>
      </div>
    )
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-3xl mx-auto py-10">
        <ResumePreview data={resumeData} template={resumeData.template} accentcolor={resumeData.accent_color} classes="py-4 bg-white" />
      </div>
    </div>
  )
}

export default Preview
