import { Briefcase, Plus, Sparkles, Trash2, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import api from '../configs/api'
import toast from 'react-hot-toast'

const ExperienceForm = ({ data, onChange, token }) => {
  const [enhancingIndex, setEnhancingIndex] = useState(null)

  const addExperience = () => {
    const newExperience = {
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false
    };
    onChange([...(data || []), newExperience]);
  };

  const removeExperience = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated); // FIXED
  };

  const updateExperience = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated); // FIXED
  };

  const enhanceDescription = async (index) => {
    const experience = data[index];
    if (!experience.description) {
      toast.error('Please write a description first');
      return;
    }
    try {
      setEnhancingIndex(index);
      const prompt = `Enhance this job description for a resume, making it more impactful and professional. Keep it concise and focus on achievements: ${experience.description}`;
      const response = await api.post('/api/ai/enhance-pro-sum', { userContent: prompt }, { headers: { Authorization: token } });
      if (response.data?.enhancedContent) {
        updateExperience(index, 'description', response.data.enhancedContent);
        toast.success('Description enhanced!');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to enhance description');
    } finally {
      setEnhancingIndex(null);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
            Professional Experience
          </h3>
          <p className='text-sm text-gray-500'>Add summary for your job experience</p>
        </div>

        <button
          onClick={addExperience}
          className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'
        >
          <Plus className='size-4' />
          Add Experience
        </button>
      </div>

      {data.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <Briefcase className='w-12 h-12 mx-auto mb-3 text-gray-300' />
          <p>No Work experience added yet.</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {data.map((experience, index) => (
            <div key={index} className='border border-gray-200 rounded-lg space-y-3 p-4'>
              
              <div className='flex justify-between items-start'>
                <h4>Experience #{index + 1}</h4>

                <button
                  onClick={() => removeExperience(index)}
                  className='text-red-500 hover:text-red-700 transition-colors'
                >
                  <Trash2 className='size-4' />
                </button>
              </div>

              <div className='grid md:grid-cols-2 gap-3'>
                <input
                  value={experience.company}
                  onChange={(e) => updateExperience(index, "company", e.target.value)}
                  type="text"
                  placeholder='Company Name'
                  className='px-3 py-2 text-sm rounded-lg'
                />

                <input
                  value={experience.position}
                  onChange={(e) => updateExperience(index, "position", e.target.value)}
                  type="text"
                  placeholder='Job Title'
                  className='px-3 py-2 text-sm rounded-lg'
                />

                <input
                  value={experience.start_date}
                  onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                  type="month"
                  className='px-3 py-2 text-sm rounded-lg'
                />

                <input
                  value={experience.end_date}
                  onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                  type="month"
                  disabled={experience.is_current}
                  className='px-3 py-2 text-sm rounded-lg disabled:bg-gray-100'
                />
              </div>

              <label className='flex items-center gap-2'>
                <input
                  type="checkbox"
                  checked={experience.is_current}
                  onChange={(e) => updateExperience(index, "is_current", e.target.checked)}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>Currently working here</span>
              </label>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium text-gray-700'>Job Description</label>

                  <button
                    type="button"
                    onClick={() => enhanceDescription(index)}
                    disabled={enhancingIndex === index}
                    className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
                    {enhancingIndex === index ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {enhancingIndex === index ? 'Enhancing...' : 'Enhance with AI'}
                  </button>

                </div>

                <textarea
                  value={experience.description}
                  onChange={(e) => updateExperience(index, "description", e.target.value)} // FIXED
                  rows={4}
                  className='w-full text-sm px-3 py-2 rounded-lg resize-none'
                  placeholder='Describe your key responsibilities and achievements...'
                />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceForm;
