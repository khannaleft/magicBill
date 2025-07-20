import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, ProfileFormData, ToastMessage } from '../types';

interface ClinicProfileProps {
  userId: string;
  profile: Profile | null;
  onClose: () => void;
  onSave: (profile: Profile) => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

function InputField({ label, id, value, onChange }: { label: string; id: keyof ProfileFormData; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
    return (
        <div>
            <label htmlFor={id as string} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1">
                <input
                    id={id as string}
                    name={id as string}
                    type="text"
                    value={value}
                    onChange={onChange}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
        </div>
    );
}

export function ClinicProfile({ userId, profile, onClose, onSave, addToast }: ClinicProfileProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    clinic_name: '',
    clinic_address: '',
    clinic_contact: '',
    clinic_reg_no: '',
    clinic_logo_url: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        clinic_name: profile.clinic_name || '',
        clinic_address: profile.clinic_address || '',
        clinic_contact: profile.clinic_contact || '',
        clinic_reg_no: profile.clinic_reg_no || '',
        clinic_logo_url: profile.clinic_logo_url,
      });
    }
  }, [profile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id as keyof ProfileFormData]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      addToast(`Logo upload failed: ${uploadError.message}`, 'error');
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);
      
    setFormData(prev => ({...prev, clinic_logo_url: publicUrl}));
    addToast('Logo uploaded successfully.', 'success');
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const profileUpdate = {
      id: userId,
      updated_at: new Date().toISOString(),
      clinic_name: formData.clinic_name || null,
      clinic_address: formData.clinic_address || null,
      clinic_contact: formData.clinic_contact || null,
      clinic_reg_no: formData.clinic_reg_no || null,
      clinic_logo_url: formData.clinic_logo_url || null,
    };

    const { data, error } = await supabase.from('profiles').upsert(profileUpdate).select().single();
    
    if (error) {
        addToast(error.message, 'error');
    } else if (data) {
        onSave(data as Profile);
        addToast('Profile saved successfully!', 'success');
        onClose();
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSave}>
            <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800">My Clinic Profile</h2>
                <p className="text-sm text-gray-500 mb-6">This information will appear on all your invoices.</p>

                <div className="space-y-4">
                    <InputField label="Clinic Name" id="clinic_name" value={formData.clinic_name || ''} onChange={handleInputChange} />
                    <div>
                        <label htmlFor="clinic_address" className="block text-sm font-medium text-gray-700">Clinic Address</label>
                        <textarea id="clinic_address" name="clinic_address" value={formData.clinic_address || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Contact Info (Phone/Email)" id="clinic_contact" value={formData.clinic_contact || ''} onChange={handleInputChange} />
                        <InputField label="Reg. No" id="clinic_reg_no" value={formData.clinic_reg_no || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label htmlFor="logo" className="block text-sm font-medium text-gray-700">Clinic Logo</label>
                        <div className="mt-2 flex items-center gap-4">
                            {formData.clinic_logo_url && <img src={formData.clinic_logo_url} alt="Clinic Logo" className="h-16 w-16 object-contain rounded-md bg-gray-100 p-1"/>}
                             <input
                                id="logo"
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                onChange={handleLogoUpload}
                                disabled={isUploading}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                             {isUploading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-8 py-4 flex justify-end items-center gap-4 rounded-b-xl">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={isSaving || isUploading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
