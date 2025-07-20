import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { InvoiceData, SavedInvoiceSummary, Profile, InvoiceDataJson, Json } from '../types';

const getInitialInvoiceData = (profile: Profile | null): InvoiceData => ({
  clinicName: profile?.clinic_name || "Your Clinic Name",
  clinicAddress: profile?.clinic_address || "Your Clinic Address",
  clinicContact: profile?.clinic_contact || "Your Contact Info",
  clinicRegNo: profile?.clinic_reg_no || "Your Registration No.",
  clinicLogo: profile?.clinic_logo_url || null,
  patientName: '',
  invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-`,
  date: new Date().toISOString().split('T')[0],
  doctorName: '',
  items: [
    { id: crypto.randomUUID(), description: 'Dental Consultation', quantity: 1, unitPrice: 500 },
  ],
  taxRate: 18,
});

interface UseInvoicesProps {
  profile: Profile | null;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  userId: string | undefined;
}

export function useInvoices({ profile, addToast, userId }: UseInvoicesProps) {
  const [currentInvoiceData, setCurrentInvoiceData] = useState<InvoiceData>(getInitialInvoiceData(profile));
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  const handleNewInvoice = useCallback(() => {
    setCurrentInvoiceData(getInitialInvoiceData(profile));
  }, [profile]);

  const fetchInvoices = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, patient_name, created_at, grand_total')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      addToast(`Error fetching invoices: ${error.message}`, 'error');
    } else if (data) {
      setSavedInvoices(data as SavedInvoiceSummary[]);
    }
    setIsLoading(false);
  }, [addToast, userId]);

  useEffect(() => {
    if (profile && userId) {
      handleNewInvoice(); // Set a fresh invoice when profile loads
      fetchInvoices();
    } else if (!userId) {
      // If user logs out, clear the invoices
      setSavedInvoices([]);
      setIsLoading(false);
    }
  }, [profile, userId, handleNewInvoice, fetchInvoices]);

  const grandTotal = useMemo(() => {
    const subtotal = currentInvoiceData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0);
    const taxAmount = (subtotal * currentInvoiceData.taxRate) / 100;
    return subtotal + taxAmount;
  }, [currentInvoiceData.items, currentInvoiceData.taxRate]);

  const handleSelectInvoice = useCallback(async (id: string) => {
    if (currentInvoiceData.id === id) return;
    setIsFetchingDetails(true);
    const { data, error } = await supabase.from('invoices').select('id, invoice_data').eq('id', id).single();

    if (error) {
      addToast(`Error fetching invoice details: ${error.message}`, 'error');
    } else if (data?.invoice_data) {
      const loadedData = data.invoice_data as unknown as InvoiceDataJson;
      setCurrentInvoiceData({
        ...loadedData,
        id: data.id,
      });
    }
    setIsFetchingDetails(false);
  }, [currentInvoiceData.id, addToast]);

  const handleSaveInvoice = async () => {
    if (isSaving) return;
     if (!userId) {
      addToast('Cannot save invoice: user not identified.', 'error');
      return;
    }
    setIsSaving(true);
    
    // Ensure invoice has profile data before saving
    const dataToSave = {
        ...currentInvoiceData,
        clinicName: profile?.clinic_name || currentInvoiceData.clinicName,
        clinicAddress: profile?.clinic_address || currentInvoiceData.clinicAddress,
        clinicContact: profile?.clinic_contact || currentInvoiceData.clinicContact,
        clinicRegNo: profile?.clinic_reg_no || currentInvoiceData.clinicRegNo,
        clinicLogo: profile?.clinic_logo_url || currentInvoiceData.clinicLogo,
    };

    const { id, ...invoiceDataForJsonb } = dataToSave;

    const payload = {
      invoice_number: dataToSave.invoiceNumber,
      patient_name: dataToSave.patientName,
      grand_total: grandTotal,
      invoice_data: invoiceDataForJsonb as unknown as Json,
      user_id: userId,
    };

    const recordToUpsert = { ...payload, ...(id && { id }) };

    const { data, error } = await supabase.from('invoices').upsert(recordToUpsert).select().single();

    if (error) {
      addToast(`Error saving invoice: ${error.message}`, 'error');
    } else if (data) {
      setCurrentInvoiceData(prev => ({ ...prev, id: data.id }));
      addToast('Invoice saved successfully!', 'success');
      await fetchInvoices();
    }
    setIsSaving(false);
  };

  const handleDeleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) {
      addToast(`Error deleting invoice: ${error.message}`, 'error');
    } else {
      addToast('Invoice deleted.', 'success');
      if (currentInvoiceData.id === id) handleNewInvoice();
      await fetchInvoices();
    }
  };

  return {
    currentInvoiceData,
    setCurrentInvoiceData,
    savedInvoices,
    isLoading,
    isSaving,
    isFetchingDetails,
    handleSelectInvoice,
    handleNewInvoice,
    handleSaveInvoice,
    handleDeleteInvoice,
  };
}