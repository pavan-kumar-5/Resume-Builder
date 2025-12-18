import React, { useState } from 'react'
import { Plus, Sparkles, Trash2, X } from 'lucide-react'

const SkillsForm = ({ data, onChange }) => {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() === '') return;
    onChange([...(data || []), skillInput.trim()]);
    setSkillInput('');
  };

  const removeSkill = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
            Skills
          </h3>
          <p className='text-sm text-gray-500'>Add your professional skills and competencies</p>
        </div>
      </div>

      <div className='space-y-3'>
        <div className='flex gap-2'>
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={handleKeyPress}
            type="text"
            placeholder='Enter a skill (e.g., JavaScript, React, Project Management)'
            className='flex-1 px-3 py-2 text-sm rounded-lg'
          />
          <button
            onClick={addSkill}
            className='flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap'
          >
            <Plus className='size-4' />
            Add
          </button>
        </div>
        <p className='text-xs text-gray-500'>Tip: press <span className='font-medium'>Enter</span> to add a skill quickly, or click <span className='font-medium'>Add</span>.</p>
      </div>

      {data.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <Sparkles className='w-12 h-12 mx-auto mb-3 text-gray-300' />
          <p>No skills added yet.</p>
          <p className='text-sm'>Add your first skill above to get started.</p>
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='flex flex-wrap gap-2'>
            {data.map((skill, index) => (
              <div
                key={index}
                className='flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-900'
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill(index)}
                  className='text-blue-500 hover:text-blue-700 transition-colors'
                  title="Remove skill"
                >
                  <X className='size-3' />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsForm;
