
import React from 'react';

export enum RecordStatus {
  Active = 'نشط',
  Expired = 'منتهي',
  SoonToExpire = 'قارب على الانتهاء',
}

export enum RenewalType {
  Automatic = 'تلقائي',
  Manual = 'يدوي',
}

export enum ContractType {
    Documented = 'عقد موثق',
    Internal = 'عقد بيني',
    DocumentedAndInternal = 'عقد موثق + بيني',
}

export interface Attachment {
  data: string; // Base64 string for file data
  name: string;
  type: string;
}

export interface License {
  id: number;
  name: string;
  number: string;
  registrationDate?: string;
  expiryDate: string;
  status: RecordStatus;
  renewalType?: RenewalType;
  cost: number;
  notes?: string;
  attachments?: Attachment[];
}

export interface Contract {
  id: number;
  name: string;
  number: string;
  internalExpiryDate: string;
  documentedExpiryDate: string;
  contractType: ContractType;
  status: RecordStatus; // Overall status for filtering/sorting
  documentedStatus?: RecordStatus;
  internalStatus?: RecordStatus;
  documentedCost?: number;
  internalCost?: number;
  notes?: string;
  attachments?: Attachment[];
}

export interface Procedure {
  id: number;
  licenseName: string;
  authority: string;
  contactNumbers: string;
  email: string;
  websiteName: string;
  websiteUrl: string;
  username: string;
  password: string;
  employeeName?: string;
  employeeNumber?: string;
  requirements?: string;
  notes?: string;
  attachments?: Attachment[];
  // Added optional fields for DataTable compatibility
  status?: RecordStatus;
  expiryDate?: string;
}

// ArchivedRecord now explicitly defines the structure needed for the table, 
// plus the originalData container.
export interface ArchivedRecord {
    id: number;
    name: string;
    number?: string; // Optional because Procedure might not have 'number' in the same sense, though it has in UI
    status?: RecordStatus;
    cost?: number;
    notes?: string;
    attachments?: Attachment[];
    
    // Archive specific fields
    originalType: RecordDataType;
    deletionDate: string;
    originalData: RecordType; // Store complete original structure
}

export interface Tab {
    id: 'dashboard' | 'licenses' | 'contracts' | 'other' | 'supplierContracts' | 'otherTopics' | 'procedures' | 'trademarks' | 'allRecords' | 'archive';
    name: string;
    icon: React.FC;
}

export type RecordType = License | Contract | Procedure;

export type RecordDataType = 'commercialLicense' | 'operationalLicense' | 'civilDefenseCert' | 'specialAgency' | 'leaseContract' | 'generalContract' | 'procedure' | 'otherTopic' | 'trademarkCert';
