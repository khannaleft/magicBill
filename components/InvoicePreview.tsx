
import React, { useMemo } from 'react';
import { InvoiceData } from '../types';
import { PrintIcon, RupeeIcon } from './icons';

interface InvoicePreviewProps {
  data: InvoiceData;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Add time zone offset to prevent off-by-one day errors
        const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(utcDate);
    } catch(e) {
        return dateString;
    }
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const subtotal = useMemo(() => data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0), [data.items]);
  const taxAmount = useMemo(() => (subtotal * data.taxRate) / 100, [subtotal, data.taxRate]);
  const grandTotal = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-preview-container p-8 bg-white rounded-xl shadow-lg h-full flex flex-col">
        <div className="invoice-scroll-area flex-grow overflow-y-auto p-2">
            {/* Header */}
            <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
                <div className="flex items-start gap-4">
                    {data.clinicLogo && (
                        <img src={data.clinicLogo} alt="Clinic Logo" className="h-20 w-20 object-contain" />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-blue-700">{data.clinicName}</h1>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{data.clinicAddress}</p>
                        <p className="text-sm text-gray-600">{data.clinicContact}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">Reg. No:</span> {data.clinicRegNo}
                        </p>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <h2 className="text-3xl font-semibold text-gray-700 uppercase">Invoice</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-semibold">#</span>{data.invoiceNumber || "N/A"}
                    </p>
                </div>
            </header>

            {/* Patient & Date Info */}
            <section className="grid grid-cols-2 gap-4 mt-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Bill To</h3>
                    <p className="text-lg font-bold text-gray-800">{data.patientName || "Patient Name"}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Date of Issue</h3>
                    <p className="text-md font-medium text-gray-800">{formatDate(data.date)}</p>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mt-2">Doctor</h3>
                    <p className="text-md font-medium text-gray-800">{data.doctorName || "Doctor's Name"}</p>
                </div>
            </section>

            {/* Items Table */}
            <section className="mt-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                            <th className="p-3 font-semibold">Service Description</th>
                            <th className="p-3 text-center font-semibold">Qty</th>
                            <th className="p-3 text-right font-semibold">Unit Price</th>
                            <th className="p-3 text-right font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.length > 0 ? data.items.map(item => (
                            <tr key={item.id} className="border-b border-gray-100">
                                <td className="p-3">{item.description || "Service not specified"}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-3 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-gray-400">No services added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Totals */}
            <section className="flex justify-end mt-8">
                <div className="w-full max-w-sm space-y-3">
                    <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                        <span>GST ({data.taxRate}%)</span>
                        <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 pt-3 mt-3 border-gray-200">
                        <span>Grand Total</span>
                        <span className="flex items-center"><RupeeIcon />{formatCurrency(grandTotal).replace('₹','')}</span>
                    </div>
                </div>
            </section>

             {/* Footer */}
             <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Thank you for choosing {data.clinicName}. We wish you a speedy recovery!</p>
                <p>This is a computer-generated invoice.</p>
            </footer>
        </div>
        
        <div className="mt-6 text-center print-hidden">
            <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                <PrintIcon />
                Print / Save as PDF
            </button>
        </div>
    </div>
  );
}