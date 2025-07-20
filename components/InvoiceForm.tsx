import React from 'react';
import { InvoiceData, ServiceItem, Profile } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface InvoiceFormProps {
  data: InvoiceData;
  setData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  profile: Profile | null;
  isSaving: boolean;
  onSave: () => void;
}

function FormSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    return (
        <details className="group" open={defaultOpen}>
            <summary className="flex justify-between items-center cursor-pointer list-none py-3 border-b-2 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <span className="text-gray-500 transition-transform transform group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </summary>
            <div className="pt-6 pb-4 space-y-4">
                {children}
            </div>
        </details>
    );
}

function InputField({ label, id, value, onChange, type = 'text', placeholder }: { label: string; id: keyof Pick<InvoiceData, 'patientName' | 'doctorName' | 'invoiceNumber' | 'date'>; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1">
                <input
                    id={id}
                    name={id}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={value}
                    onChange={onChange}
                    type={type}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}


export function InvoiceForm({ data, setData, profile, isSaving, onSave }: InvoiceFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleItemChange = (id: string, field: keyof ServiceItem, value: string | number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }]
    }));
  };
  
  const removeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg h-full flex flex-col">
      <div className='flex-grow overflow-y-auto pr-2'>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Invoice Details</h2>
        <div className="space-y-2">
            <FormSection title="Clinic Details">
                <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 space-y-1">
                  <p><span className="font-semibold text-slate-700">Name:</span> {profile?.clinic_name || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-700">Address:</span> {profile?.clinic_address || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-700">Contact:</span> {profile?.clinic_contact || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-700">Reg. No:</span> {profile?.clinic_reg_no || 'N/A'}</p>
                  <p className="text-xs text-slate-500 pt-2">To edit these details, click "My Clinic" in the header.</p>
                </div>
            </FormSection>
            
            <FormSection title="Patient & Invoice Info" defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Patient Name" id="patientName" value={data.patientName} onChange={handleInputChange} placeholder="e.g. Ananya Sharma" />
                  <InputField label="Doctor's Name" id="doctorName" value={data.doctorName} onChange={handleInputChange} placeholder="e.g. Dr. Rajesh Gupta" />
                  <InputField label="Invoice Number" id="invoiceNumber" value={data.invoiceNumber} onChange={handleInputChange} placeholder="e.g. INV-2024-001" />
                  <InputField label="Date" id="date" value={data.date} onChange={handleInputChange} type="date" />
                </div>
            </FormSection>

            <FormSection title="Services / Treatments" defaultOpen={true}>
                <div className="space-y-3">
                  {data.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-md">
                      <div className="col-span-12 sm:col-span-5">
                        <label className="text-xs text-gray-600">Description</label>
                        <input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="e.g. Root Canal Therapy" className="w-full text-sm p-2 border border-gray-300 rounded-md" />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className="text-xs text-gray-600">Qty</label>
                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} className="w-full text-sm p-2 border border-gray-300 rounded-md" />
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <label className="text-xs text-gray-600">Unit Price (₹)</label>
                        <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full text-sm p-2 border border-gray-300 rounded-md" />
                      </div>
                      <div className="col-span-4 sm:col-span-2 flex items-end h-full">
                        <button onClick={() => removeItem(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2">
                  <PlusIcon />
                  Add Service
                </button>
            </FormSection>

            <FormSection title="Taxation" defaultOpen={true}>
                <div>
                    <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">GST Rate (%)</label>
                    <div className="mt-1">
                        <input
                            id="taxRate"
                            type="number"
                            value={data.taxRate}
                            onChange={(e) => setData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                            className="block w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. 18"
                        />
                    </div>
                </div>
            </FormSection>
        </div>
      </div>
      <div className="mt-6 border-t pt-6">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
        >
          {isSaving ? 'Saving...' : (data.id ? 'Save Changes' : 'Save Invoice')}
        </button>
      </div>
    </div>
  );
}