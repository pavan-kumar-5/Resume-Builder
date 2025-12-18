import React, { useState } from 'react'
import { Mail, Phone, MapPin } from "lucide-react";

async function handleDetect(imgEl, setObjectPosition) {
    try {
        if (!imgEl) return;
        if ('FaceDetector' in window) {
            const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
            const faces = await detector.detect(imgEl)
            if (faces && faces.length > 0) {
                const box = faces[0].boundingBox
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

const MinimalImageTemplate = ({ data, accentColor = "#3B82F6" }) => {
    const [objectPosition, setObjectPosition] = useState('50% 50%')
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    };

    const personalInfo = data.personal_info || {};

    return (
        <div className="max-w-5xl mx-auto bg-white text-zinc-800 min-h-[11in]">
            <div className="grid grid-cols-3">
                <div className="col-span-1 py-10">
                    {/* Image */}
                    {personalInfo.image && typeof personalInfo.image === 'string' ? (
                        <div className="mb-6">
                            <div className="w-32 h-32 rounded-full mx-auto overflow-hidden">
                                <img src={personalInfo.image} alt="Profile" className="w-full h-full object-cover" style={{ background: accentColor+'70', objectPosition }} onLoad={(e) => handleDetect(e.currentTarget, setObjectPosition)} />
                            </div>
                        </div>
                    ) : (
                        personalInfo.image && typeof personalInfo.image === 'object' ? (
                                <div className="mb-6">
                                    <div className="w-32 h-32 rounded-full mx-auto overflow-hidden">
                                        <img src={URL.createObjectURL(personalInfo.image)} alt="Profile" className="w-full h-full object-cover" style={{ objectPosition }} onLoad={(e) => handleDetect(e.currentTarget, setObjectPosition)} />
                                    </div>
                                </div>
                        ) : null
                    )}
                </div>

                {/* Name + Title */}
                <div className="col-span-2 flex flex-col justify-center py-10 px-8">
                    <h1 className="text-4xl font-bold text-zinc-700 tracking-widest">
                        {personalInfo.full_name || "Your Name"}
                    </h1>
                    <p className="uppercase text-zinc-600 font-medium text-sm tracking-widest">
                        {personalInfo.profession || "Profession"}
                    </p>
                </div>

                {/* Left Sidebar */}
                <aside className="col-span-1 border-r border-zinc-400 p-6 pt-0">
                    {/* Contact */}
                    <section className="mb-8">
                        <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3">
                            CONTACT
                        </h2>
                        <div className="space-y-2 text-sm">
                            {personalInfo.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={14} style={{ color: accentColor }} />
                                    <span>{personalInfo.phone}</span>
                                </div>
                            )}
                            {personalInfo.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={14} style={{ color: accentColor }} />
                                    <span>{personalInfo.email}</span>
                                </div>
                            )}
                            {personalInfo.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} style={{ color: accentColor }} />
                                    <span>{personalInfo.location}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Education */}
                    {data.education && data.education.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3">
                                EDUCATION
                            </h2>
                            <div className="space-y-4 text-sm">
                                {data.education.map((edu, index) => (
                                    <div key={index}>
                                        <p className="font-semibold uppercase">{edu.degree}</p>
                                        <p className="text-zinc-600">{edu.institution}</p>
                                        <p className="text-xs text-zinc-500">
                                            {formatDate(edu.graduation_date)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {data.skills && data.skills.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3">
                                SKILLS
                            </h2>
                            <ul className="space-y-1 text-sm">
                                {data.skills.map((skill, index) => (
                                    <li key={index}>{skill}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </aside>

                {/* Right Content */}
                <main className="col-span-2 p-8 pt-0">
                    {/* Summary */}
                    {data.professional_summary && (
                        <section className="mb-8">
                            <h2 className="text-sm font-semibold tracking-widest mb-3" style={{ color: accentColor }} >
                                SUMMARY
                            </h2>
                            <p className="text-zinc-700 leading-relaxed">
                                {data.professional_summary}
                            </p>
                        </section>
                    )}

                    {/* Experience */}
                    {data.experience && data.experience.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold tracking-widest mb-4" style={{ color: accentColor }} >
                                EXPERIENCE
                            </h2>
                            <div className="space-y-6 mb-8">
                                {data.experience.map((exp, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-zinc-900">
                                                {exp.position}
                                            </h3>
                                            <span className="text-xs text-zinc-500">
                                                {formatDate(exp.start_date)} -{" "}
                                                {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2" style={{ color: accentColor }} >
                                            {exp.company}
                                        </p>
                                        {exp.description && (
                                            <ul className="list-disc list-inside text-sm text-zinc-700 leading-relaxed space-y-1">
                                                {exp.description.split("\n").map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data.project && data.project.length > 0 && (
                        <section>
                            <h2 className="text-sm uppercase tracking-widest font-semibold" style={{ color: accentColor }}>
                                PROJECTS
                            </h2>
                            <div className="space-y-4">
                                {data.project.map((project, index) => (
                                    <div key={index}>
                                        <h3 className="text-md font-medium text-zinc-800 mt-3">{project.name}</h3>
                                        <p className="text-sm mb-1" style={{ color: accentColor }} >
                                            {project.type}
                                        </p>
                                        {project.description && (
                                            <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">
                                                {project.description.split("\n").map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

export default MinimalImageTemplate;