import React from 'react';
import { useToasts, ToastContainer } from './hooks/useToasts';
import { useAuth } from './hooks/useAuth';
import { useInvoices } from './hooks/useInvoices';

import { Auth } from './components/Auth';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { ClinicProfile } from './components/ClinicProfile';

function App() {
  const { toasts, addToast, removeToast } = useToasts();
  const { 
    session, 
    user, 
    profile, 
    isLoading: isAuthLoading, 
    showProfileModal, 
    setShowProfileModal, 
    handleLogout, 
    updateProfile 
  } = useAuth({ addToast });
  
  const {
    currentInvoiceData,
    setCurrentInvoiceData,
    savedInvoices,
    isLoading: isInvoicesLoading,
    isSaving,
    isFetchingDetails,
    handleSelectInvoice,
    handleNewInvoice,
    handleSaveInvoice,
    handleDeleteInvoice,
  } = useInvoices({ profile, addToast, userId: user?.id });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Auth addToast={addToast} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="max-w-screen-2xl mx-auto mb-8 print-hidden">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 tracking-tight">Dental Invoice Cloud</h1>
              <p className="text-slate-500 mt-1">Welcome, {profile?.clinic_name || user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowProfileModal(true)} className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">
                My Clinic
              </button>
              <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-8 max-w-screen-2xl mx-auto items-start">
          {/* Left Column - Saved Invoices */}
          <div className="lg:col-span-1 xl:col-span-3 h-full">
            <InvoiceList 
              invoices={savedInvoices}
              activeInvoiceId={currentInvoiceData.id}
              onSelect={handleSelectInvoice}
              onDelete={handleDeleteInvoice}
              onNew={handleNewInvoice}
              isLoading={isInvoicesLoading}
            />
          </div>

          {/* Middle Column - Invoice Form */}
          <div className="lg:col-span-2 xl:col-span-5 h-full print-hidden">
            <InvoiceForm
                data={currentInvoiceData}
                setData={setCurrentInvoiceData}
                profile={profile}
                isSaving={isSaving}
                onSave={handleSaveInvoice}
            />
          </div>

          {/* Right Column - Invoice Preview */}
          <div id="invoice-preview-wrapper" className="lg:col-span-3 xl:col-span-4 xl:sticky top-8 h-full">
            {isFetchingDetails ? (
                 <div className="flex justify-center items-center h-full bg-white rounded-xl shadow-lg p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 </div>
            ) : (
                <InvoicePreview data={currentInvoiceData} />
            )}
          </div>
        </main>
      </div>
      
      {showProfileModal && user && (
        <ClinicProfile
          userId={user.id}
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSave={updateProfile}
          addToast={addToast}
        />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
