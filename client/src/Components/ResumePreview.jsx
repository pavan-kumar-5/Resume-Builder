import React from 'react'
import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate'
import MinimalTemplate from './templates/MinimalTemplate'
import MinimalImageTemplate from './templates/MinimalImageTemplate'

const ResumePreview = ({ data, template, accentcolor, classes = "" }) => {
  console.log('Rendering template:', template)


  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={data} accentColor={accentcolor} />
      case "minimal":
        return <MinimalTemplate data={data} accentColor={accentcolor} />
      case "minimal-image":
        return <MinimalImageTemplate data={data} accentColor={accentcolor} />
      case "classical":
      default:
        return <ClassicTemplate data={data} accentColor={accentcolor} />
    }
  }

  return (
    <div className="w-full bg-gray-100 flex justify-center p-4">
      <div
        id="resume-preview"
        className={`bg-white border border-gray-200 shadow-sm print:shadow-none print:border-none ${classes}`}
        style={{
          width: '8.5in',
          minHeight: '11in',
        }}
      >
        {renderTemplate()}
      </div>

      <style jsx>{`
        @page {
          size: 8.5in 11in;
          margin: 0;
        }

        @media print {
          html, body {
            width: 8.5in;
            height: 11in;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          body * {
            visibility: hidden;
          }

          #resume-preview, #resume-preview * {
            visibility: visible;
          }

          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 8.5in !important;
            height: 11in !important;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default ResumePreview