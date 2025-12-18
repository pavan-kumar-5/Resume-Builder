import { BriefcaseBusiness, Globe, Linkedin, Mail, MapPin, Phone, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const PersonalinfoForm = ({ data, onChange, removeBackground, setRemoveBackground }) => {
 
  const handleChange = (field, value) => {
    const updatedData = {
      ...data,
      [field]: value
    }
    onChange(updatedData)
  }

  const fields = [
    { key: "full_name", label: "Full Name", icon: User, type: "text", required: true },
    { key: "email", label: "Email Address", icon: Mail, type: "email", required: true },
    { key: "phone", label: "Phone Number", icon: Phone, type: "tel" },
    { key: "location", label: "Location", icon: MapPin, type: "text" },
    { key: "profession", label: "Profession", icon: BriefcaseBusiness, type: "text" },
    { key: "linkedin", label: "LinkedIn Profile", icon: Linkedin, type: "url" },
    { key: "website", label: "Personal Website", icon: Globe, type: "url" }
  ]

  const [objectPosition, setObjectPosition] = useState('50% 50%')

  useEffect(() => {
    // Reset to center when image changes
    setObjectPosition('50% 50%')
  }, [data?.image])

  const detectFaceAndCenter = async (imgEl) => {
    try {
      if (!imgEl) return;
      if ('FaceDetector' in window) {
        const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
        const faces = await detector.detect(imgEl)
        if (faces && faces.length > 0) {
          const box = faces[0].boundingBox
          // center of detected face
          const cx = box.x + box.width / 2
          const cy = box.y + box.height / 2
          const px = Math.round((cx / imgEl.naturalWidth) * 100)
          const py = Math.round((cy / imgEl.naturalHeight) * 100)
          const pos = `${px}% ${py}%`
          console.debug('FaceDetector found face:', { box, px, py, pos })
          setObjectPosition(pos)
          return
        }
      }
    } catch (err) {
      console.debug('FaceDetector error', err)
    }
    setObjectPosition('50% 50%')
  }

  return (
    <div className='px-2'>
      <h3 className='text-lg font-semibold text-gray-900'>Personal Information</h3>
      <p className='text-sm text-gray-600'>Get started with your personal information</p>
      
      <div className='flex items-center gap-2 mt-5'>
        <label className="cursor-pointer">
          {data?.image ? (
            <div className='w-16 h-16 rounded-full overflow-hidden inline-block'>
              <img 
                src={typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image)} 
                alt='user' 
                className='w-full h-full object-cover ring ring-slate-300 hover:opacity-80'
                style={{ objectPosition }}
                onLoad={(e) => detectFaceAndCenter(e.currentTarget)}
              />
            </div>
          ) : (
            <div className='inline-flex items-center gap-2 text-slate-600 hover:text-slate-700'>
              <User className='w-10 h-10 p-2.5 border rounded-full text-slate-500'/>
              Upload photo
            </div>
          )}
          <input 
            type='file' 
            accept='image/jpeg, image/png' 
            className='hidden' 
            onChange={(e) => handleChange("image", e.target.files[0])}
          />
        </label>
        
        {data?.image && (
          <div className='flex flex-col gap-1 pl-4 text-sm'>
            <p>Remove Background</p>
            <label className='relative inline-flex items-center cursor-pointer gap-3'>
              <input 
                type='checkbox' 
                className='sr-only peer' 
                onChange={() => setRemoveBackground(prev => !prev)} 
                checked={removeBackground}
              />
              <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-600 transition-colors duration-200 relative overflow-hidden'>
                <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out transform peer-checked:translate-x-4'></span>
              </div>
            </label>
          </div>
        )}
      </div>

      {fields.map((field) => {
        const Icon = field.icon;
        return (
          <div key={field.key} className='space-y-1 mt-5'>
            <label className='flex items-center gap-2 text-sm font-medium text-gray-600'>
              <Icon className='w-4 h-4'/>
              {field.label}
              {field.required && <span className='text-red-500'>*</span>}
            </label>
            <input 
              type={field.type} 
              value={data?.[field.key] || ""} 
              onChange={(e) => handleChange(field.key, e.target.value)} 
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm' 
              placeholder={`Enter your ${field.label.toLowerCase()}`} 
              required={field.required}
            />
          </div>
        )
      })}
    </div>
  )
}

export default PersonalinfoForm