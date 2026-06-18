import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { FileText, ArrowLeft, Download, Plus, Trash2, User, HelpCircle } from 'lucide-react';
import jsPDF from 'jspdf';

export default function CVGenerator() {
  const { user } = useAuthStore();
  const { getDocument } = useFirestore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Personal details
  const [personalDetails, setPersonalDetails] = useState({
    gender: 'Male',
    nrc: '',
    phone: '',
    email: '',
    languages: 'English',
    hobbies: 'Reading, Community service'
  });

  // Multiple Qualifications
  const [educationList, setEducationList] = useState([
    { qualification: 'Grade 12 School Certificate', school: 'Munali Secondary School', location: 'Lusaka, Lusaka Province', startDate: '2018', endDate: '2021' }
  ]);

  // Work experiences
  const [experiences, setExperiences] = useState([
    { jobTitle: 'Assistant Technician', company: 'VoltTech Electricals', duration: 'Jan 2022 - Dec 2023', description: 'Assisted in electrical wiring\nHandled customer repairs\nMaintained tools inventory' }
  ]);

  // Referees list (limit to 3)
  const [refereesList, setRefereesList] = useState([
    { name: 'Dr. Joseph Banda', jobTitle: 'Senior Advisor', organization: 'TEVETA Zambia', phone: '0977123456', email: 'banda@teveta.org.zm' }
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
          
          setPersonalDetails(prev => ({
            ...prev,
            email: data.email || user.email || prev.email,
            languages: data.languages || prev.languages,
            phone: data.phone || prev.phone
          }));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user, getDocument]);

  const handleAddEducation = () => {
    setEducationList(prev => [...prev, { qualification: '', school: '', location: '', startDate: '', endDate: '' }]);
  };

  const handleRemoveEducation = (index) => {
    setEducationList(prev => prev.filter((_, i) => i !== index));
  };

  const handleEduChange = (index, field, value) => {
    setEducationList(prev => {
      const newEdu = [...prev];
      newEdu[index][field] = value;
      return newEdu;
    });
  };

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

  const handleAddReferee = () => {
    if (refereesList.length >= 3) return;
    setRefereesList(prev => [...prev, { name: '', jobTitle: '', organization: '', phone: '', email: '' }]);
  };

  const handleRemoveReferee = (index) => {
    setRefereesList(prev => prev.filter((_, i) => i !== index));
  };

  const handleRefereeChange = (index, field, value) => {
    setRefereesList(prev => {
      const newRef = [...prev];
      newRef[index][field] = value;
      return newRef;
    });
  };

  const generatePDF = () => {
    if (!profile) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    const addText = (text, x, y, size = 11, isBold = false, align = 'left', color = [0, 0, 0]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, x, y, { align });
      return y + (size * 0.4); // return new y approx
    };

    // Main Header - CURRICULUM VITAE
    yPos = addText('CURRICULUM VITAE', pageWidth / 2, yPos, 22, true, 'center', [0, 0, 0]);
    yPos += 8;

    // SECTION 1: PERSONAL DETAILS
    yPos = addText('PERSONAL DETAILS', 20, yPos, 14, true, 'left', [0, 0, 0]);
    doc.setDrawColor(0, 0, 0);
    doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
    yPos += 4;

    yPos = addText(`* Name: ${profile.fullName}`, 20, yPos, 11);
    yPos += 2;
    yPos = addText(`* Sex: ${personalDetails.gender}`, 20, yPos, 11);
    yPos += 2;
    yPos = addText(`* Identification Number (NRC): ${personalDetails.nrc || 'N/A'}`, 20, yPos, 11);
    yPos += 2;
    yPos = addText(`* Phone Number: ${personalDetails.phone || 'N/A'}`, 20, yPos, 11);
    yPos += 2;
    yPos = addText(`* Email Address: ${personalDetails.email || 'N/A'}`, 20, yPos, 11);
    yPos += 2;
    yPos = addText(`* Languages: ${personalDetails.languages || 'English'}`, 20, yPos, 11);
    yPos += 6;

    // SECTION 2: PROFESSIONAL SUMMARY
    yPos = addText('PROFESSIONAL SUMMARY', 20, yPos, 14, true, 'left', [0, 0, 0]);
    doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
    yPos += 4;

    const splitSummary = doc.splitTextToSize(professionalSummary, pageWidth - 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(splitSummary, 20, yPos);
    yPos += (splitSummary.length * 5) + 6;

    // SECTION 3: EDUCATION
    const validEdus = educationList.filter(edu => edu.qualification.trim() !== '');
    if (validEdus.length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      yPos = addText('EDUCATION', 20, yPos, 14, true, 'left', [0, 0, 0]);
      doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
      yPos += 4;

      validEdus.forEach(edu => {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        yPos = addText(`* ${edu.qualification}`, 20, yPos, 11, true);
        yPos = addText(`  ${edu.school}, ${edu.location}`, 20, yPos, 11);
        yPos = addText(`  ${edu.startDate} to ${edu.endDate}`, 20, yPos, 10, false, 'left', [100, 100, 100]);
        yPos += 5;
      });
      yPos += 3;
    }

    // SECTION 4: WORK EXPERIENCE
    const validExps = experiences.filter(exp => exp.jobTitle.trim() !== '');
    if (validExps.length > 0) {
      if (yPos > 230) { doc.addPage(); yPos = 20; }
      yPos = addText('WORK EXPERIENCE', 20, yPos, 14, true, 'left', [0, 0, 0]);
      doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
      yPos += 4;

      validExps.forEach(exp => {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        yPos = addText(`* ${exp.jobTitle} at ${exp.company}`, 20, yPos, 11, true);
        yPos = addText(`  ${exp.duration}`, 20, yPos, 10, false, 'left', [100, 100, 100]);
        yPos += 2;
        
        if (exp.description) {
          yPos = addText('  Responsibilities:', 20, yPos, 10, true);
          const splitLines = exp.description.split('\n').filter(l => l.trim() !== '');
          splitLines.forEach(line => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            const cleanLine = line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•') ? line.trim() : `* ${line.trim()}`;
            const splitLine = doc.splitTextToSize(`    ${cleanLine}`, pageWidth - 45);
            doc.text(splitLine, 20, yPos);
            yPos += (splitLine.length * 5);
          });
        }
        yPos += 4;
      });
      yPos += 2;
    }

    // SECTION 5: SKILLS & EXPERTISE
    if (profile.selectedSkills && profile.selectedSkills.length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      yPos = addText('SKILLS & EXPERTISE', 20, yPos, 14, true, 'left', [0, 0, 0]);
      doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
      yPos += 4;

      profile.selectedSkills.forEach(s => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        yPos = addText(`* ${s}`, 20, yPos, 11);
        yPos += 1.5;
      });
      yPos += 4;
    }

    // SECTION 6: HOBBIES
    if (personalDetails.hobbies) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      yPos = addText('HOBBIES', 20, yPos, 14, true, 'left', [0, 0, 0]);
      doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
      yPos += 4;

      const splitHobbies = personalDetails.hobbies.split(',').map(h => h.trim());
      splitHobbies.forEach(hobby => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        yPos = addText(`* ${hobby}`, 20, yPos, 11);
        yPos += 1.5;
      });
      yPos += 4;
    }

    // SECTION 7: REFEREES
    const validRefs = refereesList.filter(ref => ref.name.trim() !== '');
    if (validRefs.length > 0) {
      if (yPos > 210) { doc.addPage(); yPos = 20; }
      yPos = addText('REFEREES', 20, yPos, 14, true, 'left', [0, 0, 0]);
      doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
      yPos += 4;

      validRefs.forEach((ref, idx) => {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        yPos = addText(`${idx + 1}. ${ref.name}, ${ref.jobTitle} @ ${ref.organization}`, 20, yPos, 11, true);
        yPos = addText(`   Phone Number: ${ref.phone} | Email: ${ref.email}`, 20, yPos, 11);
        yPos += 4.5;
      });
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
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-4">
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
            <p className="text-sm text-gray-500 font-medium">Auto-generate a standard NRC-compliant Zambian PDF CV using your profile details.</p>
          </div>
        </div>
        <button onClick={generatePDF} className="btn-primary py-3 px-6 shadow-xl flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700">
          <Download className="w-5 h-5" /> Download Standard CV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">1. Personal & Contact Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lblClass}>Sex / Gender</label>
                <select className={inpClass} value={personalDetails.gender} onChange={e => setPersonalDetails({...personalDetails, gender: e.target.value})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={lblClass}>Identification (NRC Number)</label>
                <input type="text" className={inpClass} placeholder="e.g. 123456/11/1" value={personalDetails.nrc} onChange={e => setPersonalDetails({...personalDetails, nrc: e.target.value})} />
              </div>
              <div>
                <label className={lblClass}>Phone Number</label>
                <input type="text" className={inpClass} placeholder="e.g. 0961234567" value={personalDetails.phone} onChange={e => setPersonalDetails({...personalDetails, phone: e.target.value})} />
              </div>
              <div>
                <label className={lblClass}>Email Address</label>
                <input type="email" className={inpClass} placeholder="e.g. name@domain.com" value={personalDetails.email} onChange={e => setPersonalDetails({...personalDetails, email: e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className={lblClass}>Languages</label>
                <input type="text" className={inpClass} placeholder="e.g. English, Bemba, Nyanja" value={personalDetails.languages} onChange={e => setPersonalDetails({...personalDetails, languages: e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className={lblClass}>Hobbies</label>
                <input type="text" className={inpClass} placeholder="e.g. Reading, Football, Agriculture" value={personalDetails.hobbies} onChange={e => setPersonalDetails({...personalDetails, hobbies: e.target.value})} />
              </div>
            </div>

            <div>
              <label className={lblClass}>Professional Summary</label>
              <textarea
                className={`${inpClass} min-h-24`}
                value={professionalSummary}
                onChange={(e) => setProfessionalSummary(e.target.value)}
              />
            </div>

            {/* Education History List */}
            <div>
              <div className="flex items-center justify-between mb-4 mt-8 border-t border-gray-50 pt-4">
                <label className={lblClass + " !mb-0"}>2. Education Qualifications</label>
                <button type="button" onClick={handleAddEducation} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <Plus className="w-3 h-3" /> Add Qualification
                </button>
              </div>

              <div className="space-y-4">
                {educationList.map((edu, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 relative">
                    {educationList.length > 1 && (
                      <button type="button" onClick={() => handleRemoveEducation(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Qualification Name</label>
                        <input type="text" className={inpClass + " !py-2"} placeholder="e.g. Grade 12 Certificate or Diploma" value={edu.qualification} onChange={e => handleEduChange(idx, 'qualification', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">School / College</label>
                          <input type="text" className={inpClass + " !py-2"} placeholder="e.g. Munali Secondary School" value={edu.school} onChange={e => handleEduChange(idx, 'school', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Location</label>
                          <input type="text" className={inpClass + " !py-2"} placeholder="e.g. Lusaka, Zambia" value={edu.location} onChange={e => handleEduChange(idx, 'location', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Year</label>
                          <input type="text" className={inpClass + " !py-2"} placeholder="e.g. 2018" value={edu.startDate} onChange={e => handleEduChange(idx, 'startDate', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Year</label>
                          <input type="text" className={inpClass + " !py-2"} placeholder="e.g. 2021" value={edu.endDate} onChange={e => handleEduChange(idx, 'endDate', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div>
              <div className="flex items-center justify-between mb-4 mt-8 border-t border-gray-50 pt-4">
                <label className={lblClass + " !mb-0"}>3. Work Experience</label>
                <button type="button" onClick={handleAddExperience} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Job Title / Role</label>
                        <input type="text" className={inpClass + " !py-2"} placeholder="e.g. Electrician" value={exp.jobTitle} onChange={e => handleExpChange(idx, 'jobTitle', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Company / Organization</label>
                        <input type="text" className={inpClass + " !py-2"} placeholder="e.g. VoltTech Ltd" value={exp.company} onChange={e => handleExpChange(idx, 'company', e.target.value)} />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Duration</label>
                      <input type="text" className={inpClass + " !py-2"} placeholder="e.g. Jan 2022 - Present" value={exp.duration} onChange={e => handleExpChange(idx, 'duration', e.target.value)} />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Responsibilities (One per line)</label>
                      <textarea className={inpClass + " !py-2 min-h-24"} placeholder="Installed electrical components&#10;Repaired motors&#10;Handled customer queries" value={exp.description} onChange={e => handleExpChange(idx, 'description', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referees */}
            <div>
              <div className="flex items-center justify-between mb-4 mt-8 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-1.5">
                  <label className={lblClass + " !mb-0"}>4. Referees (Up to 3)</label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">STANDARD CV</span>
                </div>
                {refereesList.length < 3 && (
                  <button type="button" onClick={handleAddReferee} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <Plus className="w-3 h-3" /> Add Referee
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {refereesList.map((ref, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 relative">
                    <button type="button" onClick={() => handleRemoveReferee(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                        <input type="text" className={inpClass + " !py-2"} placeholder="e.g. Dr. Joseph Banda" value={ref.name} onChange={e => handleRefereeChange(idx, 'name', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Job Title</label>
                          <input type="text" className={inpClass + " !py-2"} placeholder="e.g. Senior Manager" value={ref.jobTitle} onChange={e => handleRefereeChange(idx, 'jobTitle', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Organization</label>
                          <input type="text" className={inpClass + " !py-2"} placeholder="e.g. TEVETA Zambia" value={ref.organization} onChange={e => handleRefereeChange(idx, 'organization', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                          <input type="text" className={inpClass + " !py-2"} placeholder="e.g. 0977123456" value={ref.phone} onChange={e => handleRefereeChange(idx, 'phone', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Address</label>
                          <input type="email" className={inpClass + " !py-2"} placeholder="e.g. ref@domain.zm" value={ref.email} onChange={e => handleRefereeChange(idx, 'email', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Preview panel */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 sticky top-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">Standard CV Preview</h2>
            
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 font-mono text-[10px] leading-relaxed text-gray-700 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              <div className="text-center font-bold text-xs uppercase mb-4">CURRICULUM VITAE</div>
              
              <div className="font-bold border-b border-gray-300 pb-0.5 mb-1.5 uppercase">PERSONAL DETAILS</div>
              <div>* Name: {profile.fullName}</div>
              <div>* Sex: {personalDetails.gender}</div>
              <div>* NRC: {personalDetails.nrc || '[NRC Number]'}</div>
              <div>* Phone: {personalDetails.phone || '[Phone Number]'}</div>
              <div>* Email: {personalDetails.email || '[Email Address]'}</div>
              <div>* Languages: {personalDetails.languages || 'English'}</div>

              <div className="font-bold border-b border-gray-300 pb-0.5 mb-1.5 mt-4 uppercase">PROFESSIONAL SUMMARY</div>
              <div className="font-sans leading-normal">{professionalSummary || '[No summary defined]'}</div>

              <div className="font-bold border-b border-gray-300 pb-0.5 mb-1.5 mt-4 uppercase">EDUCATION</div>
              {educationList.filter(e => e.qualification).map((edu, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-bold">* {edu.qualification}</div>
                  <div>  {edu.school}, {edu.location}</div>
                  <div className="text-gray-400">  {edu.startDate} to {edu.endDate}</div>
                </div>
              ))}

              <div className="font-bold border-b border-gray-300 pb-0.5 mb-1.5 mt-4 uppercase">WORK EXPERIENCE</div>
              {experiences.filter(e => e.jobTitle).map((exp, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-bold">* {exp.jobTitle} at {exp.company}</div>
                  <div className="text-gray-400">  {exp.duration}</div>
                  {exp.description && (
                    <div className="mt-1">
                      <div className="font-bold">  Responsibilities:</div>
                      {exp.description.split('\n').map((l, i) => (
                        <div key={i}>    * {l.trim()}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="font-bold border-b border-gray-300 pb-0.5 mb-1.5 mt-4 uppercase">SKILLS & EXPERTISE</div>
              {profile.selectedSkills?.map((s, i) => (
                <div key={i}>* {s}</div>
              ))}

              <div className="font-bold border-b border-gray-300 pb-0.5 mb-1.5 mt-4 uppercase">HOBBIES</div>
              {personalDetails.hobbies?.split(',').map((h, i) => (
                <div key={i}>* {h.trim()}</div>
              ))}

              <div className="font-bold border-b border-gray-300 pb-0.5 mb-1.5 mt-4 uppercase">REFEREES</div>
              {refereesList.filter(r => r.name).map((ref, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-bold">{idx + 1}. {ref.name}</div>
                  <div>   {ref.jobTitle} @ {ref.organization}</div>
                  <div>   Ph: {ref.phone} | Email: {ref.email}</div>
                </div>
              ))}
            </div>

            <button onClick={generatePDF} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
              <Download className="w-5 h-5" /> Download Standard CV
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
