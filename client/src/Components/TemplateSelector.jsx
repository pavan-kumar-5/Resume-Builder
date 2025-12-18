import { Check, Layout } from 'lucide-react'
import React, { useState } from 'react'

const TemplateSelector = ({ selectedTemplate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    
    const templates = [
        {
            id: "classical",
            name: "Classic",
            preview: "A clean, traditional resume format with clear sections and professional typography"
        },
        {
            id: "modern",
            name: "Modern", 
            preview: "Sleek design with strategic use of color and modern font choices"
        },
        {
            id: "minimal-image",
            name: "Minimal Image",
            preview: "Minimal design with a single image and clean typography"
        },
        {
            id: "minimal",
            name: "Minimal",
            preview: "Ultra-clean design that puts your content front and center"
        },
    ]

    return (
        <div className='relative'>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className='flex items-center gap-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all px-3 py-2 rounded-lg font-medium'
            >
                <Layout size={16} /> 
                <span>Template</span>
            </button>
            
            {isOpen && (
                <div className='absolute top-full left-0 w-80 p-4 mt-2 space-y-3 z-50 bg-white rounded-lg border border-gray-200 shadow-xl'>
                    <h3 className='font-semibold text-gray-800 text-sm'>Choose a Template</h3>
                    {templates.map((template) => (
                        <div 
                            key={template.id} 
                            onClick={() => {
                                onChange(template.id)
                                setIsOpen(false)
                            }} 
                            className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedTemplate === template.id 
                                    ? "border-blue-500 bg-blue-50" 
                                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-25"
                            }`}
                        >
                            {selectedTemplate === template.id && (
                                <div className='absolute top-3 right-3'>
                                    <div className='size-5 bg-blue-500 rounded-full flex items-center justify-center'>
                                        <Check className='w-3 h-3 text-white'/>
                                    </div>    
                                </div>
                            )}
                            
                            <div>
                                <h4 className='font-semibold text-gray-800'>{template.name}</h4>
                                <div className='mt-1 text-xs text-gray-600 leading-relaxed'>
                                    {template.preview}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TemplateSelector