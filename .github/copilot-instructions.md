# Copilot Instructions: Resume Builder

## Project Overview
Resume Builder is a React + Vite single-page application for creating, editing, and previewing professional resumes with multiple template options and dynamic styling. It uses client-side state management with dummy data (no backend) and exports resumes to PDF via browser print functionality.

## Architecture

### Core Structure
- **`src/main.jsx`**: App entry point with `BrowserRouter` wrapper for React Router
- **`src/App.jsx`**: Route definitions (7 routes total) using React Router v7
- **Pages** (`src/pages/`):
  - `Home.jsx`: Landing page with features and hero content
  - `Dashboard.jsx`: Resume management hub (list, create, upload, delete)
  - `ResumeBuilder.jsx`: Main editing interface with sectioned form + live preview
  - `Preview.jsx`: Public resume viewing (read-only)
  - `Login.jsx`: Authentication stub (not yet implemented)
  - `Layout.jsx`: Wrapper with Navbar and route outlets

### Data Flow
1. **Resume Data Structure** (`src/assets/assets.js`):
   - Root object: `resumeData` with properties like `personel_info`, `professional_summary`, `experience[]`, `education[]`, `project[]`, `skills[]`, `template`, `accent_color`
   - Loaded via `dummyResumeData` array (mock data)
   - Updates via `setResumeData()` state mutations in `ResumeBuilder`

2. **State Management** (All in `ResumeBuilder.jsx`):
   - Single state: `resumeData` object tracking all resume content
   - Section-based UI: 6 tabs (Personal, Summary, Experience, Education, Projects, Skills)
   - Form component passes `updatePersonalInfo()`, `updateSummary()` etc. callbacks up to parent

3. **Template System**:
   - Four templates: `classical`, `modern`, `minimal`, `minimal-image`
   - Template files: `src/assets/templates/*.jsx` (render-only, receive `data` + `accentColor` props)
   - Routing: `ResumePreview.jsx` (wrapper) → `switch` statement → template component
   - Print-to-PDF: CSS `@media print` styles handle layout/visibility (8.5"×11" US Letter)

### Styling & Theme
- **Framework**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Global Fonts**: Outfit (imported in `index.css`)
- **Accent Colors**: 10 predefined colors in `ColorPicker.jsx` (stored as hex in `resumeData.accent_color`)
- **Base Styles** (`index.css`): 
  - Global font setup
  - `@layer base` for button/input/textarea defaults (focus states with blue rings)

## Development Workflow

### Commands
- `npm run dev`: Start Vite dev server (hot reload)
- `npm run build`: Production build to `dist/`
- `npm run lint`: ESLint check
- `npm run preview`: Preview built output

### Key Dependencies
- **React 19.1.1**: JSX, hooks (useState, useEffect)
- **React Router v7.9.4**: Routing and params (useParams, useNavigate)
- **Tailwind CSS 4**: Utility-first CSS
- **Lucide React**: Icon library (Mail, Phone, User, etc. imported as needed)
- **Vite 7**: Fast build tool with HMR

## Code Patterns & Conventions

### Components
- **Functional components** with hooks (no class components)
- **Props-based**: Templates receive `data` + `accentColor`; forms receive callbacks
- **Naming**: PascalCase for components (e.g., `PersonalinfoForm.jsx` — note typo "Personel" used consistently in codebase)
- **Event Handlers**: Inline `onChange`, `onClick` with arrow functions
- **Form Components** (in `src/Components/`):
  - `PersonalinfoForm.jsx`: Personal details + profile image upload
  - `ExperienceForm.jsx`: Add/edit/remove work experience entries
  - `EducationForm.jsx`: Add/edit/remove education entries
  - `ProjectsForm.jsx`: Add/edit/remove projects with descriptions
  - `SkillsForm.jsx`: Add/remove skills as tags (string array)

### State Updates
- Use **immutable spread pattern**: `setResumeData(prev => ({ ...prev, field: newValue }))`
- Form handlers: Extract field values → call parent callback with partial update object
- Example: `updatePersonalInfo()` merges into `personel_info` sub-object

### Conditional Rendering
- **Optional chaining**: `data.personel_info?.full_name`
- **Fallback text**: "Your Name" in templates if field missing
- **Render guards**: `{data.professional_summary && <section>...}</section>`

### String Formatting
- **Dates**: Parse "YYYY-MM" format → `new Date(year, month-1).toLocaleDateString(...)`
- **URLs**: Rendered as plain text with `break-all` class to prevent layout break

### Template Conventions
- Each template imports icons from `lucide-react`
- Uses inline `style={{ borderColor: accentColor }}` for dynamic colors
- Fixed dimensions: `width: 8.5in; minHeight: 11in` (US Letter)
- Print CSS isolates `#resume-preview` div for clean output

### Image Handling
- Profile image: File upload stored in `personel_info.image`
- File object converted to blob URL: `URL.createObjectURL(data.image)`
- Fallback: Lucide icon if no image
- Type check: `typeof data.image === 'string'` to distinguish URL from File object

## Integration Points

### Form Sections (ResumeBuilder)
Each section has a corresponding component in `src/Components/` that:
1. Receives current data subset + onChange callback
2. Renders inputs/textareas with Tailwind styling
3. Calls callback with updated partial object on change

Example: `PersonalinfoForm` → `updatePersonalInfo(updatedPersonalInfo)` → merged into state

### Preview Updates
- `ResumePreview` watches template + accentColor props
- Re-renders chosen template on any state change
- No computed derived state; templates receive full data object

### Routing Params
- Builder: `/app/builder/:resumeId` → loads resume via `useParams()` then searches `dummyResumeData`
- Preview: `/view/:resumeId` → similar pattern
- Create new: Navigate to builder with fixed ID (currently `res123` placeholder)

## Known Quirks & TO-DO Items
- **Backend missing**: All data is dummy/mock; no persistence
- **Typo in codebase**: `personel_info` (not "personal") — used consistently; maintain for backward compatibility
- **Login stub**: Route exists but no auth logic
- **Upload feature**: UI present but not implemented (placeholder navigate)

## Adding Features

### New Template
1. Create file: `src/assets/templates/MyTemplate.jsx`
2. Export component receiving `{ data, accentColor }` props
3. Add to template list in `TemplateSelector.jsx`
4. Add case in `ResumePreview.jsx` switch statement

### New Resume Section (e.g., Languages)
1. Add field array to `resumeData` initial state
2. Create form component: `src/Components/LanguagesForm.jsx`
3. Add section object to `sections` array with icon + name
4. Create update callback: `updateLanguages()`
5. Render form and template section (use accentColor for headings)

### New Accent Color
- Add object to `colors` array in `ColorPicker.jsx`
- Color will auto-appear in picker UI

## Quick Troubleshooting
- **Resume not loading**: Check `resumeId` param vs `_id` in `dummyResumeData`
- **Template not rendering**: Verify template case in `ResumePreview` switch matches `resumeData.template`
- **Print layout broken**: Ensure `#resume-preview` div styles unchanged; check `@media print` rules
- **Icons missing**: Confirm imports from `lucide-react` match icon names
- **Styling not applying**: Verify Tailwind class names; check `@layer base` overrides
