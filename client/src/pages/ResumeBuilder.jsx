import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  Folder,
  GraduationCap,
  Share2,
  Sparkles,
  User
} from 'lucide-react'
import PersonalinfoForm from '../Components/PersonalinfoForm'
import ResumePreview from '../Components/ResumePreview'
import TemplateSelector from '../Components/TemplateSelector'
import ColorPicker from '../Components/ColorPicker'
import ExperienceForm from '../Components/ExperienceForm'
import EducationForm from '../Components/EducationForm'
import ProjectsForm from '../Components/ProjectsForm'
import SkillsForm from '../Components/SkillsForm'
import ProfessionalSummary from '../Components/ProfessionalSummary'
const ResumeBuilder = () => {
  const { resumeId } = useParams()
  const {token} = useSelector(state => state.auth)
  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    personal_info: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      profession: "",
      linkedin: "",
      website: "",
      image: "" // This holds the URL string or the File object
    },
    professional_summary: '',
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: 'classical',
    accent_color: '#3B82F6',
    public: false,
  })
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [removeBackground, setRemoveBackground] = useState(false)
  const sections = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'summary', name: 'Summary', icon: FileText },
    { id: 'experience', name: 'Experience', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'projects', name: 'Projects', icon: Folder },
    { id: 'skills', name: 'Skills', icon: Sparkles },
  ]

  useEffect(() => {
    const loadExistingResume = async () => {
      if (!resumeId) return;
      try {
        const {data} = await api.get('/api/resumes/get/'+ resumeId, {headers: {Authorization:token}})
        if(data.resume){
          setResumeData(data.resume)
          document.title = data.resume.title
        }
      } catch (error) {
        console.log('Error loading resume:', error.message)
      }
    }
    loadExistingResume()
  }, [resumeId, token])
  const handleTemplateChange = (newTemplate) => {
    setResumeData(prev => ({
      ...prev,
      template: newTemplate
    }))
  }
const changeResumeVisibility = async () => {
  try {
    const { data } = await api.put(
      '/api/resumes/update',
      { resumeId, resumeData: { public: !resumeData.public } },
      { headers: { Authorization: token } }
    );
    // update local state with server response (authoritative)
    setResumeData(data.resume);
    toast.success(data.message);
  } catch (error) {
console.error("Error saving resume:", error);
    toast.error(error?.response?.data?.message || 'Failed to update visibility');
  }
}
const handleShare = async () => {
  const frontendUrl = window.location.href.split('/app/')[0]
  const resumeUrl = frontendUrl+'/view/'+resumeId;
  if (navigator.share) {
    navigator.share({ url: resumeUrl, text: 'My Resume!', })
  }else{
    alert('Share not supported in this browser.');
  }
}
const downloadResume = () => {
  window.print()
}
const saveResume = () => {
  // Return the axios promise so callers (toast.promise) can observe success/failure
  // Prepare payload
  let updatedResumeData = structuredClone(resumeData);
  if (typeof resumeData.personal_info.image === 'object') {
    delete updatedResumeData.personal_info.image;
  }
  const formData = new FormData();
  formData.append('resumeId', resumeId);
  formData.append('resumeData', JSON.stringify(updatedResumeData));
  if (removeBackground) formData.append('removeBackground', 'yes');
  // If a fresh File object is present append it; otherwise when removeBackground is requested
  // and we already have an image URL, send the URL so the server can fetch and process it.
  if (typeof resumeData.personal_info.image === 'object') {
    formData.append('image', resumeData.personal_info.image);
  } else if (removeBackground && typeof resumeData.personal_info.image === 'string') {
    formData.append('imageUrl', resumeData.personal_info.image);
  }
  return api.put('/api/resumes/update', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // let axios set the Content-Type (including boundary) for multipart/form-data
    },
  }).then(({ data }) => {
    setResumeData(data.resume);
    return data;
  });
}
  return (
    <div>
      {/* Top Navigation */}
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <Link
          to={'/app'}
          className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all'
        >
          <ArrowLeft className='w-4 h-4' /> Back to Dashboard
        </Link>
      </div>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Left Panel - Form */}
          <div className='lg:col-span-5'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              {/* Navigation Buttons with Template Selector */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  {/* Template Selector - Now on the left side */}
                  <TemplateSelector 
                    selectedTemplate={resumeData.template}
                    onChange={handleTemplateChange}
                  />
                  
                  <ColorPicker 
                    selectedColor={resumeData.accent_color} 
                    onChange={(color) => setResumeData(prev => ({...prev, accent_color: color}))}
                  />
                </div>
                {activeSectionIndex !== 0 ? (
                  <button
                    onClick={() =>
                      setActiveSectionIndex((prev) => Math.max(prev - 1, 0))
                    }
                    className="flex items-center gap-1 p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  onClick={() =>
                    setActiveSectionIndex((prev) =>
                      Math.min(prev + 1, sections.length - 1)
                    )
                  }
                  className={`flex items-center gap-1 p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${
                    activeSectionIndex === sections.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  disabled={activeSectionIndex === sections.length - 1}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {/* Progress Line */}
              <div className="relative mb-6">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${((activeSectionIndex + 1) * 100) / sections.length}%`,
                    }}
                  ></div>
                </div>
              </div>
              {/* Form Content */}
              <div className='space-y-6'>
                {sections[activeSectionIndex].id === 'personal' && (
                  <PersonalinfoForm
                    data={resumeData.personal_info}
                    onChange={(data)=>setResumeData(prev => ({...prev, personal_info: data}))}
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                  />
                )}
                
                {sections[activeSectionIndex].id === 'summary' && (
                  <ProfessionalSummary
                    data={resumeData.professional_summary}
                    onChange={(value) => setResumeData(prev => ({...prev, professional_summary: value}))}
                    token={token}
                  />
                )}
                
                {sections[activeSectionIndex].id === 'experience' && (
                  <ExperienceForm 
                    data={resumeData.experience} 
                    onChange={(updatedExperience) => setResumeData(prev => ({...prev, experience: updatedExperience}))}
                    token={token}
                  />
                )}
                
                {sections[activeSectionIndex].id === 'education' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Education</h3>
                    <EducationForm 
                      data={resumeData.education} 
                      onChange={(data) => setResumeData(prev => ({...prev, education: data}))} 
                    />
                  </div>
                )}
                
                {sections[activeSectionIndex].id === 'projects' && (
                  <div>
                    <ProjectsForm 
                      data={resumeData.project} 
                      onChange={(updatedProjects) => setResumeData(prev => ({...prev, project: updatedProjects}))} 
                    />
                  </div>
                )}
                
                {sections[activeSectionIndex].id === 'skills' && (
                  <div>
                    <SkillsForm 
                      data={resumeData.skills} 
                      onChange={(updatedSkills) => setResumeData(prev => ({...prev, skills: updatedSkills}))} 
                    />
                  </div>
                )}
            </div>
            <button onClick={() => toast.promise(saveResume(), {loading: 'Saving...', success: 'Saved', error: 'Save failed'})} className='bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm'>
                Save Changes
              </button>
            </div>
          </div>
          {/* Right Panel - Preview */}
          <div className="lg:col-span-7">
            <div className='relative w-full'>
                <div className='absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2'>
                {resumeData.public && (
                  <button onClick={handleShare} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors'>
                    <Share2 className='size-4' />Share
                  </button>
                )}
                <button onClick={changeResumeVisibility} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors'>
                  {resumeData.public ? <Eye className='size-4' /> : <EyeOff className='size-4' />}
                  {resumeData.public ? ' Public' : 'Private'}
                </button>
                <button onClick={downloadResume} className='flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 ring-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
                  <Download className='size-4' />Download
                </button>
                </div>
            </div>
            <ResumePreview 
              data={resumeData} 
              template={resumeData.template}
              accentcolor={resumeData.accent_color}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export default ResumeBuilder
