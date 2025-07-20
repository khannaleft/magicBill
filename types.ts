export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: any }
  | any[]

export interface Database {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string
          created_at: string
          invoice_number: string | null
          patient_name: string | null
          grand_total: number | null
          invoice_data: Json | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          invoice_number?: string | null
          patient_name?: string | null
          grand_total?: number | null
          invoice_data?: Json | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          invoice_number?: string | null
          patient_name?: string | null
          grand_total?: number | null
          invoice_data?: Json | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          clinic_name: string | null
          clinic_address: string | null
          clinic_contact: string | null
          clinic_reg_no: string | null
          clinic_logo_url: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          clinic_name?: string | null
          clinic_address?: string | null
          clinic_contact?: string | null
          clinic_reg_no?: string | null
          clinic_logo_url?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          clinic_name?: string | null
          clinic_address?: string | null
          clinic_contact?: string | null
          clinic_reg_no?: string | null
          clinic_logo_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

// The main invoice type used in the application state.
export interface InvoiceData {
  id?: string; // Optional: only present for saved invoices
  clinicLogo: string | null;
  clinicName: string;
  clinicAddress: string;
  clinicContact: string;
  clinicRegNo: string;
  patientName: string;
  invoiceNumber: string;
  date: string;
  doctorName: string;
  items: ServiceItem[];
  taxRate: number;
}

// Omit 'id' for JSONB storage, as the row itself has an id.
export type InvoiceDataJson = Omit<InvoiceData, 'id'>;

export interface SavedInvoiceSummary {
    id: string;
    invoice_number: string | null;
    patient_name: string | null;
    created_at: string;
    grand_total: number | null;
}

export interface Profile {
  id: string;
  updated_at: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  clinic_contact: string | null;
  clinic_reg_no: string | null;
  clinic_logo_url: string | null;
}

export type ProfileFormData = Omit<Profile, 'id' | 'updated_at'>;

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}