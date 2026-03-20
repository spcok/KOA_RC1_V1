import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Stethoscope, ClipboardList, BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { useAnimalProfileData } from './useAnimalProfileData';
import { IUCNBadge } from './IUCNBadge';
import AnimalFormModal from './AnimalFormModal';
import SignGenerator from './SignGenerator';
import MedicalRecords from '../medical/MedicalRecords';
import { ProfileActionBar } from './ProfileActionBar';
import { HusbandryLogs } from '../husbandry/HusbandryLogs';

export interface Props {
  animalId?: string;
  onBack?: () => void;
}

export default function AnimalProfile({ animalId, onBack }: Props) {
  const { id } = useParams<{ id: string }>();
  const effectiveId = animalId || id || '';
  const { animal, isLoading, archiveAnimal, orgProfile } = useAnimalProfileData(effectiveId);
  const [activeTab, setActiveTab] = useState<'profile' | 'medical' | 'husbandry' | 'notes' | 'logs'>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSignGeneratorOpen, setIsSignGeneratorOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!animal) return <div className="p-8 text-center">Animal not found.</div>;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FileText },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'husbandry', label: 'Husbandry', icon: ClipboardList },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'logs', label: 'Logs', icon: Clock },
  ] as const;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft size={18} /> Back
        </button>
      )}
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
        {/* Left Column: Identity & ZLA Record */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[280px] xl:h-[340px] rounded-xl overflow-hidden shadow-sm">
            <img
              src={animal.image_url || '/offline-media-fallback.svg'}
              alt={animal.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = '/offline-media-fallback.svg'; }}
            />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-slate-900">{animal.name}</h1>
              <IUCNBadge status={animal.red_list_status} />
            </div>
            <div className="flex flex-col gap-0.5 mb-4">
              <p className="text-slate-500 font-mono text-sm">ID: {animal.id}</p>
              <p className="text-slate-500 font-mono text-sm">Ring Number: {animal.ring_number || 'Un-ringed'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
              <div>
                <span className="text-slate-400 block mb-1">Species</span>
                <span className="font-medium text-slate-900">{animal.species}</span>
                {animal.latin_name && (
                  <span className="block text-slate-500 italic text-xs">{animal.latin_name}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Sex</span>
                <span className="font-medium text-slate-900">{animal.sex || 'Unknown'}</span>
              </div>
              
              <div>
                <span className="text-slate-400 block mb-1">Status</span>
                <span className="font-medium text-slate-900">{animal.disposition_status || 'Active'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Acquisition</span>
                <span className="font-medium text-slate-900">
                  {animal.acquisition_date ? new Date(animal.acquisition_date).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              
              <div>
                <span className="text-slate-400 block mb-1">Origin</span>
                <span className="font-medium text-slate-900">{animal.origin || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Date of Birth</span>
                <span className="font-medium text-slate-900">
                  {animal.dob ? new Date(animal.dob).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <ProfileActionBar
            onEdit={() => setIsEditModalOpen(true)}
            onSign={() => setIsSignGeneratorOpen(true)}
            onArchive={() => setIsArchiveOpen(true)}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <AnimalFormModal
          isOpen={isEditModalOpen}
          initialData={animal}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Sign Generator Modal */}
      {isSignGeneratorOpen && (
        <SignGenerator
          animal={animal}
          orgProfile={orgProfile}
          onClose={() => setIsSignGeneratorOpen(false)}
        />
      )}
      
      {/* Archive Dialog (Placeholder for now) */}
      {isArchiveOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold">Archive Animal</h2>
            <p>Are you sure you want to archive {animal.name}?</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setIsArchiveOpen(false)} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
              <button onClick={() => { archiveAnimal('Archived by user', 'Disposition'); setIsArchiveOpen(false); }} className="px-4 py-2 bg-red-600 text-white rounded">Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition ${
                activeTab === tab.id 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[400px]">
        {activeTab === 'profile' && <div className="text-slate-600">Profile details for {animal.name}</div>}
        {activeTab === 'medical' && <MedicalRecords animalId={animal.id} />}
        {activeTab === 'husbandry' && <HusbandryLogs animalId={animal.id} animal={animal} />}
        {activeTab === 'notes' && <div className="text-slate-600">Clinical notes...</div>}
        {activeTab === 'logs' && <div className="text-slate-600">Daily logs...</div>}
      </div>
    </div>
  );
}
