
import React from 'react';
import { SavedInvoiceSummary } from '../types';
import { TrashIcon } from './icons';

interface InvoiceListProps {
  invoices: SavedInvoiceSummary[];
  activeInvoiceId?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onNew: () => void;
  isLoading: boolean;
}

const formatCurrency = (amount: number | null) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount || 0);
};

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date(dateString));
}

export function InvoiceList({ invoices, activeInvoiceId, onSelect, onDelete, onNew, isLoading }: InvoiceListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg h-full p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">Saved Invoices</h2>
        <button 
          onClick={onNew}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + New
        </button>
      </div>
      <div className="flex-grow overflow-y-auto -mr-3 pr-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center text-gray-500 py-10 h-full flex flex-col justify-center items-center">
            <p className="font-semibold">No saved invoices found.</p>
            <p className="text-sm mt-1">Create a new invoice to get started!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {invoices.map(invoice => (
              <li key={invoice.id}>
                <div
                  onClick={() => onSelect(invoice.id)}
                  className={`group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all ${
                    activeInvoiceId === invoice.id ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-grow truncate">
                    <p className={`font-semibold text-gray-800 ${activeInvoiceId === invoice.id ? 'text-blue-800' : ''}`}>
                      {invoice.invoice_number || 'Untitled'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{invoice.patient_name || 'No Patient'}</p>
                    <p className="text-xs text-gray-400">{formatDate(invoice.created_at)} - {formatCurrency(invoice.grand_total)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if(window.confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
                        onDelete(invoice.id);
                      }
                    }}
                    className="p-2 text-gray-400 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity"
                    aria-label="Delete invoice"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
