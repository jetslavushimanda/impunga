import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { FileText, ArrowLeft, Download, Plus, Trash2, User } from 'lucide-react';
import jsPDF from 'jspdf';

export default function CVGenerator() {
  const { user } = useAuthStore();
  const { getDocument } = useFirestore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [experiences, setExperiences] = useState([
    { jobTitle: '', company: '', duration: '', description: '' }
  ]);
  const [professionalSummary, setProfessionalSummary] = useState('');

  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      try {
        const data = await getDocument('skillProfiles', user.uid);
        if (data) {
          setProfile(data);
          // Pre-fill professional summary based on top industry and skills
          const skillsStr = data.selectedSkills?.slice(0, 3).join(', ') || '';
          setProfessionalSummary(`Dedicated and skilled professional in ${data.topIndustry || 'my field'}. Strong expertise in ${skillsStr}. Seeking opportunities in ${data.preferredWorkType || 'employment'} to leverage my skills and drive results.`);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user, getDocument]);

  const handleAddExperience = () => {
    setExperiences(prev => [...prev, { jobTitle: '', company: '', duration: '', description: '' }]);
  };

  const handleRemoveExperience = (index) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const handleExpChange = (index, field, value) => {
    setExperiences(prev => {
      const newExp = [...prev];
      newExp[index][field] = value;
      return newExp;
    });
  };

  const generatePDF = () => {
    if (!profile) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    const addText = (text, x, y, size = 12, isBold = false, align = 'left', color = [0,0,0]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, x, y, { align });
      return y + (size * 0.4); // return new y approx
    };

    // Header
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(profile.fullName?.toUpperCase() || 'YOUR NAME', pageWidth/2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${profile.district || 'City'}, ${profile.province || 'Province'} | Languages: ${profile.languages || 'English'}`, pageWidth/2, 30, { align: 'center' });

    yPos = 50;

    // Summary
    yPos = addText('PROFESSIONAL SUMMARY', 20, yPos, 14, true, 'left', [37, 99, 235]);
    doc.setDrawColor(37, 99, 235);
    doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
    yPos += 5;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const splitSummary = doc.splitTextToSize(professionalSummary, pageWidth - 40);
    doc.text(splitSummary, 20, yPos);
    yPos += (splitSummary.length * 5) + 10;

    // Skills
    if (profile.selectedSkills && profile.selectedSkills.length > 0) {
      yPos = addText('CORE SKILLS', 20, yPos, 14, true, 'left', [37, 99, 235]);
      doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
      yPos += 5;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      
      const skillsChunks = [];
      for (let i = 0; i < profile.selectedSkills.length; i += 2) {
        skillsChunks.push(profile.selectedSkills.slice(i, i + 2));
      }

      skillsChunks.forEach(chunk => {
        const line = chunk.map(s => `• ${s}`).join('          ');
        yPos = addText(line, 20, yPos, 11);
        yPos += 1;
      });
      yPos += 5;
    }

    // Work Experience
    const validExps = experiences.filter(e => e.jobTitle.trim() !== '');
    if (validExps.length > 0) {
      yPos = addText('WORK EXPERIENCE', 20, yPos, 14, true, 'left', [37, 99, 235]);
      doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
      yPos += 5;

      validExps.forEach(exp => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(exp.jobTitle.toUpperCase(), 20, yPos);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(exp.duration, pageWidth - 20, yPos, { align: 'right' });
        yPos += 5;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(50, 50, 50);
        doc.text(exp.company, 20, yPos);
        yPos += 6;

        if (exp.description) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const splitDesc = doc.splitTextToSize(exp.description, pageWidth - 40);
          doc.text(splitDesc, 20, yPos);
          yPos += (splitDesc.length * 5) + 6;
        }
      });
    }

    // Education
    if (profile.educationLevel) {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      yPos = addText('EDUCATION & TRAINING', 20, yPos, 14, true, 'left', [37, 99, 235]);
      doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
      yPos += 5;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(profile.educationLevel, 20, yPos);
      yPos += 10;
    }

    doc.save(`${profile.fullName.replace(/\s+/g, '_')}_CV.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading Profile Data..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">No Skill Profile Found</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">You need to build your skill profile before generating a CV.</p>
        <button onClick={() => navigate('/skill-profile-builder')} className="btn-primary w-full py-3">
          Build My Profile
        </button>
      </div>
    );
  }

  const inpClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white transition-all";
  const lblClass = "block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide";

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in px-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">CV Generator</h1>
            <p className="text-sm text-gray-500 font-medium">Auto-generate a professional PDF CV using your profile.</p>
          </div>
        </div>
        <button onClick={generatePDF} className="btn-primary py-3 px-6 shadow-xl flex items-center gap-2 whitespace-nowrap">
          <Download className="w-5 h-5" /> Download PDF
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Profile Info Preview */}
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
          <h2 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-widest">Base Profile Data (Auto-filled)</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-800 mb-4">
            <div><span className="font-bold">Name:</span> {profile.fullName}</div>
            <div><span className="font-bold">Location:</span> {profile.district}, {profile.province}</div>
            <div><span className="font-bold">Education:</span> {profile.educationLevel}</div>
            <div><span className="font-bold">Languages:</span> {profile.languages || 'N/A'}</div>
          </div>
          <div>
            <span className="font-bold text-sm text-blue-800 block mb-2">Extracted Skills:</span>
            <div className="flex flex-wrap gap-1.5">
              {profile.selectedSkills?.map(s => (
                <span key={s} className="bg-white text-blue-700 px-2 py-1 rounded-md text-xs font-semibold shadow-sm">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Customizable Fields */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">Customize CV Content</h2>

          <div>
            <label className={lblClass}>Professional Summary</label>
            <textarea
              className={`${inpClass} min-h-24`}
              value={professionalSummary}
              onChange={(e) => setProfessionalSummary(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-8">
              <label className={lblClass + " !mb-0"}>Work Experience</label>
              <button type="button" onClick={handleAddExperience} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                <Plus className="w-3 h-3" /> Add Role
              </button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 relative">
                  {experiences.length > 1 && (
                    <button type="button" onClick={() => handleRemoveExperience(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Job Title / Role</label>
                      <input type="text" className={inpClass + " !py-2"} placeholder="e.g. Lead Electrician" value={exp.jobTitle} onChange={e => handleExpChange(idx, 'jobTitle', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Company / Project</label>
                      <input type="text" className={inpClass + " !py-2"} placeholder="e.g. ZESCO or Self-Employed" value={exp.company} onChange={e => handleExpChange(idx, 'company', e.target.value)} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Duration</label>
                    <input type="text" className={inpClass + " !py-2"} placeholder="e.g. Jan 2022 - Present" value={exp.duration} onChange={e => handleExpChange(idx, 'duration', e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Key Responsibilities / Achievements</label>
                    <textarea className={inpClass + " !py-2 min-h-20"} placeholder="Managed installation of..." value={exp.description} onChange={e => handleExpChange(idx, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
