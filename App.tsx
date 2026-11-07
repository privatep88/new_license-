
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import SecondaryHeader from './components/SecondaryHeader';
import LicenseManagement from './components/LicenseManagement';
import ContractManagement from './components/ContractManagement';
import SpecialAgenciesManagement from './components/OtherTopics';
import SupplierContractsManagement from './components/SupplierContractsManagement';
import AllRecordsManagement from './components/AllRecordsManagement';
import ArchiveManagement from './components/ArchiveManagement';
import Modal from './components/Modal';
import RecordForm from './components/RecordForm';
import Footer from './components/Footer';
import type { Tab, RecordType, RecordDataType, License, Contract, Procedure, ArchivedRecord } from './types';
import { RecordStatus } from './types';
import { TABS, MOCK_COMMERCIAL_LICENSES, MOCK_OPERATIONAL_LICENSES, MOCK_CIVIL_DEFENSE_CERTS, MOCK_SPECIAL_AGENCIES, MOCK_LEASE_CONTRACTS, MOCK_GENERAL_CONTRACTS, MOCK_PROCEDURES, ADMIN_EMAIL, MOCK_OTHER_TOPICS, MOCK_TRADEMARK_CERTS } from './constants';
import OtherTopicsContent from './components/OtherTopicsContent';
import ProceduresManagement from './components/ProceduresManagement';
import NotificationBanner from './components/NotificationBanner';
import TrademarkManagement from './components/TrademarkManagement';
import Dashboard from './components/Dashboard';
import { CheckIcon } from './components/icons/ActionIcons';
import OfficialLogo from './components/OfficialLogo';
import { formatCost } from './utils';
import LoginPage from './components/LoginPage';
import { getActiveSession, clearActiveSession, AuthUserSession } from './auth';

const getOverallStatus = (statuses: (RecordStatus | undefined)[]): RecordStatus => {
    const validStatuses = statuses.filter(Boolean) as RecordStatus[];
    if (validStatuses.includes(RecordStatus.Expired)) {
        return RecordStatus.Expired;
    }
    if (validStatuses.includes(RecordStatus.SoonToExpire)) {
        return RecordStatus.SoonToExpire;
    }
    return RecordStatus.Active;
};

// Moved helper outside to avoid dependency cycles and ensure it's available for init logic
const getCalculatedStatus = (expiryDate: string | undefined): RecordStatus => {
    if (!expiryDate) {
        return RecordStatus.Active; // Default if no date
    }
    const now = new Date();
    // Use start of day for consistent comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 

    const parts = expiryDate.split('-');
    if (parts.length !== 3) return RecordStatus.Active;
    
    // Create expiry date at start of day, local time
    const expiry = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    
    if (isNaN(expiry.getTime())) {
        return RecordStatus.Active; // Invalid date
    }

    if (expiry < today) {
        return RecordStatus.Expired;
    }

    const fourMonthsFromNow = new Date(today);
    fourMonthsFromNow.setDate(today.getDate() + 120); // 4 months = 120 days

    if (expiry <= fourMonthsFromNow) {
        return RecordStatus.SoonToExpire;
    }

    return RecordStatus.Active;
};

const STORAGE_KEY = 'SAHER_APP_DATA_V1';

const App: React.FC = () => {
  const [authSession, setAuthSession] = useState<AuthUserSession | null>(() => getActiveSession());
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);

  const handleLogout = () => {
    clearActiveSession();
    setAuthSession(null);
  };
  
  // Data States
  const [commercialLicenses, setCommercialLicenses] = useState<License[]>([]);
  const [operationalLicenses, setOperationalLicenses] = useState<License[]>([]);
  const [civilDefenseCerts, setCivilDefenseCerts] = useState<License[]>([]);
  const [specialAgencies, setSpecialAgencies] = useState<License[]>([]);
  const [leaseContracts, setLeaseContracts] = useState<Contract[]>([]);
  const [generalContracts, setGeneralContracts] = useState<License[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [otherTopicsData, setOtherTopicsData] = useState<License[]>([]);
  const [trademarkCerts, setTrademarkCerts] = useState<License[]>([]);
  const [archivedRecords, setArchivedRecords] = useState<ArchivedRecord[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Notification State
  const [expiringItems, setExpiringItems] = useState<Array<License | Contract>>([]);
  const [showNotification, setShowNotification] = useState(false);

  // Save Confirmation & Toast State
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isInitialMount = useRef(true); // Ref to track initial load

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Modal State
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; record?: RecordType | ArchivedRecord; type?: RecordDataType }>({ isOpen: false });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; record?: RecordType | ArchivedRecord; type?: RecordDataType; isPermanent?: boolean }>({ isOpen: false });


  // Initial Data Loading Effect (Load from LocalStorage or Fallback to Mocks)
  useEffect(() => {
    const processLicenses = (licenses: License[]): License[] => 
        licenses.map(l => ({ ...l, status: getCalculatedStatus(l.expiryDate) }));
        
    const processContracts = (contracts: Contract[]): Contract[] => 
        contracts.map(c => {
            const documentedStatus = c.documentedExpiryDate ? getCalculatedStatus(c.documentedExpiryDate) : undefined;
            const internalStatus = c.internalExpiryDate ? getCalculatedStatus(c.internalExpiryDate) : undefined;
            const status = getOverallStatus([documentedStatus, internalStatus]);
            return {
                ...c,
                documentedStatus,
                internalStatus,
                status
            };
        });

    const loadData = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        let data;

        if (savedData) {
            try {
                data = JSON.parse(savedData);
            } catch (e) {
                console.error("Failed to parse saved data", e);
            }
        }

        if (data) {
             // Load and Recalculate statuses based on current date
             setCommercialLicenses(processLicenses(data.commercialLicenses || []));
             setOperationalLicenses(processLicenses(data.operationalLicenses || []));
             setCivilDefenseCerts(processLicenses(data.civilDefenseCerts || []));
             setSpecialAgencies(processLicenses(data.specialAgencies || []));
             setLeaseContracts(processContracts(data.leaseContracts || []));
             setGeneralContracts(processLicenses(data.generalContracts || []));
             setProcedures(data.procedures || []);
             setOtherTopicsData(processLicenses(data.otherTopicsData || []));
             setTrademarkCerts(processLicenses(data.trademarkCerts || []));
             setArchivedRecords(data.archivedRecords || []);
        } else {
             // Fallback to Mocks if no saved data
             setCommercialLicenses(processLicenses(MOCK_COMMERCIAL_LICENSES));
             setOperationalLicenses(processLicenses(MOCK_OPERATIONAL_LICENSES));
             setCivilDefenseCerts(processLicenses(MOCK_CIVIL_DEFENSE_CERTS));
             setSpecialAgencies(processLicenses(MOCK_SPECIAL_AGENCIES));
             setLeaseContracts(processContracts(MOCK_LEASE_CONTRACTS));
             setGeneralContracts(processLicenses(MOCK_GENERAL_CONTRACTS));
             setProcedures(MOCK_PROCEDURES);
             setOtherTopicsData(processLicenses(MOCK_OTHER_TOPICS));
             setTrademarkCerts(processLicenses(MOCK_TRADEMARK_CERTS));
             setArchivedRecords([]);
        }
    };

    loadData();
  }, []);

  // AUTO SAVE EFFECT: Triggered whenever any data dependency changes.
  // The first run after data load saves the data but does not show a notification.
  useEffect(() => {
    const dataToSave = {
        commercialLicenses,
        operationalLicenses,
        civilDefenseCerts,
        specialAgencies,
        leaseContracts,
        generalContracts,
        procedures,
        otherTopicsData,
        trademarkCerts,
        archivedRecords
    };

    // This prevents saving on the very first render when arrays are empty,
    // which would otherwise wipe localStorage if it exists.
    const isAnyDataPresent = Object.values(dataToSave).some(arr => Array.isArray(arr) && arr.length > 0);
    if (!isAnyDataPresent && isInitialMount.current) {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

        if (isInitialMount.current) {
            // This is the first save AFTER data has been loaded.
            // Flip the flag and do NOT show a notification.
            isInitialMount.current = false;
        } else {
            // This is a subsequent, user-initiated save.
            setSaveSuccess(true);
            const timer = setTimeout(() => setSaveSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    } catch (e) {
        console.error("Auto-save failed", e);
    }
  }, [
      commercialLicenses,
      operationalLicenses,
      civilDefenseCerts,
      specialAgencies,
      leaseContracts,
      generalContracts,
      procedures,
      otherTopicsData,
      trademarkCerts,
      archivedRecords
  ]);

  const handleBackup = () => {
      const dataToSave = {
          commercialLicenses,
          operationalLicenses,
          civilDefenseCerts,
          specialAgencies,
          leaseContracts,
          generalContracts,
          procedures,
          otherTopicsData,
          trademarkCerts,
          archivedRecords,
          backupDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `SAHER_Backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target?.result as string);
              
              // Basic validation check to ensure it's a valid backup file
              // Checks for at least one known key to validate schema
              const knownKeys = ['commercialLicenses', 'leaseContracts', 'operationalLicenses', 'procedures'];
              const isValid = knownKeys.some(key => Array.isArray(json[key]));

              if (!isValid) {
                  throw new Error("Invalid backup file format");
              }

              if (window.confirm("هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.")) {
                  // Construct a clean object to save, ignoring any extra metadata from the backup file
                  const dataToRestore = {
                      commercialLicenses: json.commercialLicenses || [],
                      operationalLicenses: json.operationalLicenses || [],
                      civilDefenseCerts: json.civilDefenseCerts || [],
                      specialAgencies: json.specialAgencies || [],
                      leaseContracts: json.leaseContracts || [],
                      generalContracts: json.generalContracts || [],
                      procedures: json.procedures || [],
                      otherTopicsData: json.otherTopicsData || [],
                      trademarkCerts: json.trademarkCerts || [],
                      archivedRecords: json.archivedRecords || []
                  };

                  // Force save to local storage immediately before reload
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToRestore));
                  
                  showToast("تم استعادة النسخة الاحتياطية بنجاح.");
                  // Reload page to ensure clean state and re-initialization
                  setTimeout(() => {
                    window.location.reload();
                  }, 1200);
              }
          } catch (err) {
              console.error(err);
              showToast("فشل في استعادة النسخة الاحتياطية. تأكد من صحة الملف.");
          }
      };
      reader.readAsText(file);
  };

  // Notification Logic Effect - Reacts to ALL data changes
  useEffect(() => {
    const allRecords = [
        ...commercialLicenses,
        ...operationalLicenses,
        ...civilDefenseCerts,
        ...specialAgencies,
        ...leaseContracts,
        ...generalContracts,
        ...otherTopicsData,
        ...trademarkCerts
    ];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thresholdDate = new Date(today);
    thresholdDate.setDate(today.getDate() + 120); // 120 days window

    const expiring = allRecords.filter(item => {
        const datesToCheck: string[] = [];
        
        // Collect all relevant dates for this item
        if ('expiryDate' in item && item.expiryDate) {
            datesToCheck.push(item.expiryDate);
        }
        if ('documentedExpiryDate' in item && item.documentedExpiryDate) {
            datesToCheck.push(item.documentedExpiryDate);
        }
        if ('internalExpiryDate' in item && item.internalExpiryDate) {
            datesToCheck.push(item.internalExpiryDate);
        }

        // Check if ANY of the dates fall in the critical range (Past OR Future within 120 days)
        return datesToCheck.some(dateStr => {
            const parts = dateStr.split('-');
            if (parts.length !== 3) return false;
            const dDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            
            // Logic: Include EXPIRED (dDate < today) and SOON (dDate <= threshold)
            // Simply put: if date is less than or equal to the threshold, it's either expired or expiring soon.
            return dDate <= thresholdDate;
        });
    });

    setExpiringItems(expiring);

    // Only show notification if we found items AND user hasn't dismissed it this session
    // Or strictly if last check date changed (optional logic from before)
    const todayStr = new Date().toISOString().split('T')[0];
    const lastCheck = localStorage.getItem('lastEmailCheckDate');
    
    if (expiring.length > 0) {
        if (lastCheck !== todayStr || sessionStorage.getItem('notificationDismissed') !== 'true') {
            setShowNotification(true);
        }
        localStorage.setItem('lastEmailCheckDate', todayStr);
    } else {
        setShowNotification(false);
    }

  }, [
      commercialLicenses, 
      operationalLicenses, 
      civilDefenseCerts, 
      specialAgencies, 
      leaseContracts, 
      generalContracts, 
      otherTopicsData, 
      trademarkCerts
  ]);


  const handleAdd = (type: RecordDataType) => {
    setModalInfo({ isOpen: true, type: type, record: undefined });
  };

  const handleEdit = (record: RecordType | ArchivedRecord, type: RecordDataType) => {
     // If it's an archive record editing, we pass it directly
    setModalInfo({ isOpen: true, type: type, record: record });
  };

  const handleCloseModal = () => {
    setModalInfo({ isOpen: false, type: undefined, record: undefined });
  };
  
  const handleDelete = (recordToDelete: RecordType, type: RecordDataType) => {
    setDeleteConfirmation({ isOpen: true, record: recordToDelete, type: type, isPermanent: false });
  };

  const handlePermanentDelete = (recordToDelete: ArchivedRecord) => {
    setDeleteConfirmation({ isOpen: true, record: recordToDelete, type: recordToDelete.originalType, isPermanent: true });
  };

  const handleRestore = (item: ArchivedRecord) => {
      // 1. Remove from Archive
      setArchivedRecords(prev => prev.filter(r => r.id !== item.id));

      // 2. Add back to original list
      // We use the originalData stored in the archive to restore exactly as it was
      const originalRecord = item.originalData;
      
      // Use explicit type handling for the restoration logic
      switch (item.originalType) {
          case 'commercialLicense':
              setCommercialLicenses(prev => [...prev, originalRecord as License]);
              break;
          case 'operationalLicense':
              setOperationalLicenses(prev => [...prev, originalRecord as License]);
              break;
          case 'civilDefenseCert':
              setCivilDefenseCerts(prev => [...prev, originalRecord as License]);
              break;
          case 'specialAgency':
              setSpecialAgencies(prev => [...prev, originalRecord as License]);
              break;
          case 'leaseContract':
              setLeaseContracts(prev => [...prev, originalRecord as Contract]);
              break;
          case 'generalContract':
              setGeneralContracts(prev => [...prev, originalRecord as License]);
              break;
          case 'procedure':
              setProcedures(prev => [...prev, originalRecord as Procedure]);
              break;
          case 'otherTopic':
              setOtherTopicsData(prev => [...prev, originalRecord as License]);
              break;
          case 'trademarkCert':
              setTrademarkCerts(prev => [...prev, originalRecord as License]);
              break;
      }
      
      showToast("تم استعادة السجل بنجاح");
  };

  const handleConfirmDelete = () => {
    const { record: recordToDelete, type, isPermanent } = deleteConfirmation;
    if (!recordToDelete || !type) return;

    if (isPermanent) {
        // PERMANENT DELETE FROM ARCHIVE
        setArchivedRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
    } else {
        // SOFT DELETE (MOVE TO ARCHIVE)
        const record = recordToDelete as RecordType;
        
        // 1. Add to Archive - Construct generic properties safely
        // Determine common props or defaults if missing in source record
        const archivedItem: ArchivedRecord = {
            id: record.id,
            name: 'name' in record ? record.name : (record as any).licenseName || 'No Name',
            number: 'number' in record ? record.number : undefined,
            status: 'status' in record ? record.status : undefined,
            cost: 'cost' in record ? record.cost : undefined,
            notes: record.notes,
            attachments: record.attachments,
            
            originalType: type,
            deletionDate: new Date().toISOString(),
            originalData: record // Store deep copy/reference of original state
        };

        setArchivedRecords(prev => [archivedItem, ...prev]);

        // 2. Remove from Active List
        const setters: Partial<Record<RecordDataType, React.Dispatch<React.SetStateAction<any[]>>>> = {
            commercialLicense: setCommercialLicenses,
            operationalLicense: setOperationalLicenses,
            civilDefenseCert: setCivilDefenseCerts,
            specialAgency: setSpecialAgencies,
            leaseContract: setLeaseContracts,
            generalContract: setGeneralContracts,
            procedure: setProcedures,
            otherTopic: setOtherTopicsData,
            trademarkCert: setTrademarkCerts,
        };

        const setter = setters[type];
        if (setter) {
            setter(prev => prev.filter(r => r.id !== recordToDelete.id));
        }
    }

    setDeleteConfirmation({ isOpen: false, record: undefined, type: undefined, isPermanent: false });
  };

  const handleSave = (recordToSave: RecordType) => {
    const { type, record: originalRecord } = modalInfo;
    
    // Check if we are editing an archived record
    const isArchivedEdit = activeTab.id === 'archive';

    if (isArchivedEdit) {
        // Update the record inside the archive
        setArchivedRecords(prev => prev.map(item => {
             if (item.id === recordToSave.id) {
                 // Cast recordToSave to any to access properties safely for update
                 const updated = recordToSave as any;
                 return {
                     ...item,
                     name: updated.name || updated.licenseName || item.name,
                     number: updated.number || item.number,
                     status: updated.status || item.status,
                     notes: updated.notes || item.notes,
                     originalData: { ...item.originalData, ...recordToSave } // Update original data snapshot too
                 };
             }
             return item;
        }));
        handleCloseModal();
        return;
    }

    // Normal Save Logic
    let recordWithStatus: RecordType;
        
    if (type === 'leaseContract') {
        const contract = recordToSave as Contract;
        const documentedStatus = contract.documentedExpiryDate ? getCalculatedStatus(contract.documentedExpiryDate) : undefined;
        const internalStatus = contract.internalExpiryDate ? getCalculatedStatus(contract.internalExpiryDate) : undefined;
        const overallStatus = getOverallStatus([documentedStatus, internalStatus]);
        recordWithStatus = {
            ...contract,
            documentedStatus,
            internalStatus,
            status: overallStatus,
        };
    } else {
        let calculatedStatus: RecordStatus | undefined;
        if ('expiryDate' in recordToSave && recordToSave.expiryDate) {
            calculatedStatus = getCalculatedStatus(recordToSave.expiryDate);
        } else {
            // Procedure type usually doesn't have status, but we added optional status to type
            calculatedStatus = 'status' in recordToSave ? recordToSave.status : RecordStatus.Active;
        }
        recordWithStatus = {
            ...recordToSave,
            ...(calculatedStatus && { status: calculatedStatus }),
        };
    }
        
    const isNew = !recordToSave.id;

    const updateList = <T extends {id: number}>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
        if(isNew) {
            setter(prev => [...prev, { ...item, id: Date.now() }]);
        } else {
            setter(prev => prev.map(r => r.id === item.id ? item : r));
        }
    };
    
    const licenseSetters: Partial<Record<RecordDataType, React.Dispatch<React.SetStateAction<License[]>>>> = {
      commercialLicense: setCommercialLicenses,
      operationalLicense: setOperationalLicenses,
      civilDefenseCert: setCivilDefenseCerts,
      specialAgency: setSpecialAgencies,
      generalContract: setGeneralContracts,
      otherTopic: setOtherTopicsData,
      trademarkCert: setTrademarkCerts,
    };
    
    if (type && type in licenseSetters) {
      const setter = licenseSetters[type];
      if (setter) {
        updateList(setter, recordWithStatus as License);
      }
    } else if (type === 'leaseContract') {
      updateList(setLeaseContracts, recordWithStatus as Contract);
    } else if (type === 'procedure') {
      updateList(setProcedures, recordToSave as Procedure);
    }

    handleCloseModal();
  };
  
  // Filter Logic
  const lowercasedQuery = searchQuery.toLowerCase();
  
  const filteredCommercialLicenses = commercialLicenses.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredOperationalLicenses = operationalLicenses.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredCivilDefenseCerts = civilDefenseCerts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredSpecialAgencies = specialAgencies.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredLeaseContracts = leaseContracts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredGeneralContracts = generalContracts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredOtherTopicsData = otherTopicsData.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredTrademarkCerts = trademarkCerts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredProcedures = procedures.filter(item =>
    item.licenseName.toLowerCase().includes(lowercasedQuery) ||
    item.authority.toLowerCase().includes(lowercasedQuery) ||
    item.contactNumbers.toLowerCase().includes(lowercasedQuery) ||
    item.email.toLowerCase().includes(lowercasedQuery) ||
    item.websiteName.toLowerCase().includes(lowercasedQuery) ||
    item.websiteUrl.toLowerCase().includes(lowercasedQuery) ||
    item.username.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredArchivedRecords = archivedRecords.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    (item.number && item.number.toLowerCase().includes(lowercasedQuery)) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  // Calculate Tab Counts
  const tabCounts = useMemo(() => {
    const allRecordsCount = filteredCommercialLicenses.length + 
                    filteredOperationalLicenses.length + 
                    filteredCivilDefenseCerts.length + 
                    filteredLeaseContracts.length + 
                    filteredGeneralContracts.length + 
                    filteredSpecialAgencies.length + 
                    filteredTrademarkCerts.length + 
                    filteredOtherTopicsData.length;

    return {
        dashboard: allRecordsCount,
        licenses: filteredCommercialLicenses.length + filteredOperationalLicenses.length + filteredCivilDefenseCerts.length,
        contracts: filteredLeaseContracts.length,
        supplierContracts: filteredGeneralContracts.length,
        other: filteredSpecialAgencies.length,
        trademarks: filteredTrademarkCerts.length,
        otherTopics: filteredOtherTopicsData.length,
        procedures: filteredProcedures.length,
        allRecords: allRecordsCount,
        archive: filteredArchivedRecords.length
    };
  }, [
    filteredCommercialLicenses, 
    filteredOperationalLicenses, 
    filteredCivilDefenseCerts, 
    filteredLeaseContracts, 
    filteredGeneralContracts, 
    filteredSpecialAgencies, 
    filteredTrademarkCerts, 
    filteredOtherTopicsData, 
    filteredProcedures,
    filteredArchivedRecords
  ]);

  // Global Summary Strip Metrics (Matching Reference KPI Strip)
  const overviewMetrics = useMemo(() => {
    const allDatedRecords = [
      ...filteredCommercialLicenses,
      ...filteredOperationalLicenses,
      ...filteredCivilDefenseCerts,
      ...filteredLeaseContracts,
      ...filteredGeneralContracts,
      ...filteredSpecialAgencies,
      ...filteredTrademarkCerts,
      ...filteredOtherTopicsData,
    ];

    const totalLicensesCount =
      filteredCommercialLicenses.length +
      filteredOperationalLicenses.length +
      filteredCivilDefenseCerts.length +
      filteredTrademarkCerts.length +
      filteredOtherTopicsData.length;

    const totalActivitiesCount =
      filteredOperationalLicenses.length +
      filteredCivilDefenseCerts.length +
      filteredProcedures.length;

    const totalContractsCount =
      filteredLeaseContracts.length +
      filteredGeneralContracts.length +
      filteredSpecialAgencies.length;

    const activeRecordsCount = allDatedRecords.filter(r => r.status === RecordStatus.Active).length;
    const soonRecordsCount = allDatedRecords.filter(r => r.status === RecordStatus.SoonToExpire).length;
    const expiredRecordsCount = allDatedRecords.filter(r => r.status === RecordStatus.Expired).length;

    const licenseItems = [
      ...filteredCommercialLicenses,
      ...filteredOperationalLicenses,
      ...filteredCivilDefenseCerts,
      ...filteredGeneralContracts,
      ...filteredSpecialAgencies,
      ...filteredTrademarkCerts,
      ...filteredOtherTopicsData,
    ];
    const licensesSum = licenseItems.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    const contractsSum = filteredLeaseContracts.reduce(
      (sum, item) => sum + (Number(item.documentedCost) || 0) + (Number(item.internalCost) || 0),
      0
    );

    return {
      totalLicenses: allDatedRecords.length || totalLicensesCount,
      totalActivities: totalActivitiesCount,
      totalContracts: totalContractsCount,
      activeCount: activeRecordsCount,
      soonCount: soonRecordsCount,
      expiredCount: expiredRecordsCount,
      totalCost: licensesSum + contractsSum,
    };
  }, [
    filteredCommercialLicenses,
    filteredOperationalLicenses,
    filteredCivilDefenseCerts,
    filteredLeaseContracts,
    filteredGeneralContracts,
    filteredSpecialAgencies,
    filteredTrademarkCerts,
    filteredOtherTopicsData,
    filteredProcedures,
  ]);

  const handleSendNotificationEmail = () => {
    const subject = "تنبيه هام: سجلات تحولت إلى حالة قاربت على الانتهاء";
    const body = `
        تحية طيبة,

        يرجى العلم بأن السجلات التالية قد دخلت في فترة التنبيه (أقل من 4 أشهر) أو انتهت صلاحيتها:

        ${expiringItems.map(item =>
          `- ${item.name} (رقم: ${item.number}) - تاريخ الانتهاء: ${'expiryDate' in item ? item.expiryDate : item.documentedExpiryDate}`
        ).join('\n')}

        يرجى اتخاذ الإجراءات اللازمة للبدء في إجراءات التجديد.

        مع تحيات,
        نظام إدارة الرخص والعقود - ساعد (SAAED)
    `;
    
    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleDismissNotification = () => {
    setShowNotification(false);
    sessionStorage.setItem('notificationDismissed', 'true');
  };

  const renderContent = () => {
    switch (activeTab.id) {
      case 'dashboard':
        return <Dashboard 
                    commercialLicenses={filteredCommercialLicenses}
                    operationalLicenses={filteredOperationalLicenses}
                    civilDefenseCerts={filteredCivilDefenseCerts}
                    leaseContracts={filteredLeaseContracts}
                    generalContracts={filteredGeneralContracts}
                    specialAgencies={filteredSpecialAgencies}
                    trademarkCerts={filteredTrademarkCerts}
                    otherTopics={filteredOtherTopicsData}
                    procedures={filteredProcedures}
                />;
      case 'licenses':
        return <LicenseManagement 
                    commercialLicenses={filteredCommercialLicenses}
                    operationalLicenses={filteredOperationalLicenses}
                    civilDefenseCerts={filteredCivilDefenseCerts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'contracts':
        return <ContractManagement 
                    contracts={filteredLeaseContracts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'other':
        return <SpecialAgenciesManagement 
                    agencies={filteredSpecialAgencies}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'supplierContracts':
        return <SupplierContractsManagement
                    generalContracts={filteredGeneralContracts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'otherTopics':
        return <OtherTopicsContent
                    topics={filteredOtherTopicsData}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'procedures':
        return <ProceduresManagement
                    procedures={filteredProcedures}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'trademarks':
        return <TrademarkManagement
                    certificates={filteredTrademarkCerts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'allRecords':
        return <AllRecordsManagement
                  commercialLicenses={filteredCommercialLicenses}
                  operationalLicenses={filteredOperationalLicenses}
                  civilDefenseCerts={filteredCivilDefenseCerts}
                  leaseContracts={filteredLeaseContracts}
                  generalContracts={filteredGeneralContracts}
                  specialAgencies={filteredSpecialAgencies}
                  trademarkCerts={filteredTrademarkCerts}
                  otherTopics={filteredOtherTopicsData}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
               />;
      case 'archive':
        return <ArchiveManagement 
                 archivedRecords={filteredArchivedRecords}
                 onRestore={handleRestore}
                 onDeleteForever={handlePermanentDelete}
                 onEdit={(item) => handleEdit(item, item.originalType)}
               />;
      default:
        return <LicenseManagement 
                    commercialLicenses={filteredCommercialLicenses}
                    operationalLicenses={filteredOperationalLicenses}
                    civilDefenseCerts={filteredCivilDefenseCerts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
    }
  };

  if (!authSession) {
    return <LoginPage onLoginSuccess={(session) => setAuthSession(session)} />;
  }

  return (
    <div id="top" className="min-h-screen bg-[#eef2f6] text-slate-800 flex flex-col overflow-x-hidden min-w-0">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onBackup={handleBackup}
        onRestore={handleRestoreBackup}
        expiringCount={expiringItems.length}
        onToggleNotification={() => setShowNotification(prev => !prev)}
        userDisplayName={authSession.displayNameAr}
        userRole={authSession.roleAr}
        onLogout={handleLogout}
      />

      {/* Main Executive Hero Section with Official SAAED Logo */}
      <section className="relative w-full bg-[#091526] overflow-hidden border-b-2 border-[#eab308]/60 shadow-md print:hidden">
        {/* Background Visual Banner */}
        <div className="relative max-w-[1440px] mx-auto min-h-[210px] sm:min-h-[245px] lg:min-h-[265px] flex items-center">
          <img
            src="./assets/aistudio/hero_slice.png"
            alt="منصة ساعد لإدارة التراخيص التجارية والأنشطة والعقود"
            className="absolute inset-0 w-full h-full object-cover object-left select-none pointer-events-none"
          />
          {/* Smooth Right-to-Left Contrast Scrim for Crisp Arabic Typography */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#071326]/95 via-[#091931]/80 to-transparent lg:via-[#091931]/45 pointer-events-none" />

          {/* Hero Content on Right (RTL Start) */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col items-start text-right">
            <div className="max-w-2xl mr-0">
              {/* Harmonious Official SAAED Logo Lockup in Hero */}
              <div className="inline-flex items-center gap-3 mb-3 bg-[#091526]/75 backdrop-blur-md p-1.5 pl-4 rounded-2xl border border-[#eab308]/40 shadow-lg">
                <OfficialLogo size="sm" />
                <div className="flex flex-col text-right">
                  <span className="text-[11px] sm:text-xs font-extrabold text-[#fde047] tracking-wide">
                    الهوية المؤسسية المعتمدة — ساعد
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">
                    إدارة الخدمات العامة - قسم إدارة المرافق
                  </span>
                </div>
              </div>

              <h2 className="text-sm sm:text-lg md:text-xl lg:text-[22px] xl:text-2xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm whitespace-nowrap">
                إدارة ذكية للتراخيص التجارية والأنشطة والعقود
              </h2>
              <div className="w-48 sm:w-64 h-0.5 bg-gradient-to-l from-[#eab308] to-transparent my-2.5" />
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium max-w-lg">
                منصة مؤسسية متكاملة لتسجيل ومتابعة التراخيص التجارية والأنشطة والعقود، وإدارة تواريخ الانتهاء والتنبيهات لضمان استمرارية الأعمال والامتثال التنظيمي.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <SecondaryHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        counts={tabCounts} 
      />

      {showNotification && expiringItems.length > 0 && (
          <NotificationBanner 
              items={expiringItems}
              onSendEmail={handleSendNotificationEmail}
              onDismiss={handleDismissNotification}
          />
      )}

      {/* 7-Card Summary KPI Strip (Matching Reference Design) */}
      {activeTab.id !== 'dashboard' && (
        <section className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-5 print:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-3">
            
            {/* 1. إجمالي الرخص */}
            <div className="bg-gradient-to-b from-white to-[#f8fafc] rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div className="text-left flex-grow">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 block">إجمالي الرخص</span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 font-mono leading-tight">{overviewMetrics.totalLicenses}</span>
              </div>
            </div>

            {/* 2. إجمالي الأنشطة */}
            <div className="bg-gradient-to-b from-white to-[#f8fafc] rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-left flex-grow">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 block">إجمالي الأنشطة</span>
                <span className="text-xl sm:text-2xl font-black text-[#0f2342] font-mono leading-tight">{overviewMetrics.totalActivities}</span>
              </div>
            </div>

            {/* 3. إجمالي العقود */}
            <div className="bg-gradient-to-b from-white to-[#f8fafc] rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left flex-grow">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 block">إجمالي العقود</span>
                <span className="text-xl sm:text-2xl font-black text-[#0f2342] font-mono leading-tight">{overviewMetrics.totalContracts}</span>
              </div>
            </div>

            {/* 4. الرخص السارية */}
            <div className="bg-gradient-to-b from-white to-emerald-50/70 rounded-2xl p-3 sm:p-3.5 border border-emerald-200/80 shadow-xs flex items-center justify-between gap-2">
              <div className="p-2 rounded-full bg-emerald-600 text-white shadow-xs flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-left flex-grow">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 block">الرخص السارية</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono leading-tight">{overviewMetrics.activeCount}</span>
              </div>
            </div>

            {/* 5. قريبة من الانتهاء */}
            <div className="bg-gradient-to-b from-white to-amber-50/70 rounded-2xl p-3 sm:p-3.5 border border-amber-200/80 shadow-xs flex items-center justify-between gap-2">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600 border border-amber-200 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-left flex-grow">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 block">قريبة من الانتهاء</span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono leading-tight">{overviewMetrics.soonCount}</span>
              </div>
            </div>

            {/* 6. الرخص المنتهية */}
            <div className="bg-gradient-to-b from-white to-red-50/70 rounded-2xl p-3 sm:p-3.5 border border-red-200/80 shadow-xs flex items-center justify-between gap-2">
              <div className="p-2 rounded-full bg-red-100 text-red-600 border border-red-200 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-left flex-grow">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 block">الرخص المنتهية</span>
                <span className="text-xl sm:text-2xl font-black text-red-600 font-mono leading-tight">{overviewMetrics.expiredCount}</span>
              </div>
            </div>

            {/* 7. إجمالي التكاليف */}
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-b from-white to-[#f8fafc] rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-[#ca8a04] border border-amber-200/80 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left flex-grow min-w-0">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 block">إجمالي التكاليف</span>
                <span className="text-sm sm:text-base font-black text-[#091526] font-mono leading-tight block truncate" title={formatCost(overviewMetrics.totalCost)}>
                  {formatCost(overviewMetrics.totalCost)}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block">درهم</span>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Floating Auto-Save / Action Toast Notification */}
      <div 
        className={`fixed bottom-4 left-4 sm:left-6 sm:bottom-6 z-50 transition-all duration-300 transform ${
          toastMessage || saveSuccess ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        } flex items-center gap-2.5 bg-[#091526]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs font-semibold max-w-[calc(100vw-2rem)]`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <CheckIcon />
        <span>{toastMessage || 'تم الحفظ التلقائي بنجاح'}</span>
      </div>

      <main id="workspace" className="flex-grow py-4 sm:py-5 px-3 sm:px-6 lg:px-8 min-w-0">
        <div className="max-w-7xl mx-auto min-w-0">
          {renderContent()}
        </div>
      </main>
      <Modal isOpen={modalInfo.isOpen} onClose={handleCloseModal} title={modalInfo.record ? "تعديل السجل" : "إضافة سجل جديد"}>
        {modalInfo.isOpen && (
            <RecordForm
                initialData={
                    modalInfo.record 
                        ? ('originalData' in modalInfo.record 
                            ? (modalInfo.record as ArchivedRecord).originalData 
                            : modalInfo.record as RecordType)
                        : undefined
                }
                type={modalInfo.type!}
                onSave={handleSave}
                onCancel={handleCloseModal}
            />
        )}
      </Modal>

      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        title={deleteConfirmation.isPermanent ? "حذف نهائي" : "حذف السجل"}
        size="sm"
      >
        <div className="text-center p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-5">
              {deleteConfirmation.isPermanent ? "هل أنت متأكد من الحذف النهائي؟" : "نقل إلى الأرشيف"}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {deleteConfirmation.isPermanent 
                ? "سيتم حذف هذا السجل بشكل دائم ولا يمكن استعادته مرة أخرى."
                : "سيتم نقل السجل إلى الأرشيف (سلة المحذوفات). يمكنك استعادته لاحقاً."
              }
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setDeleteConfirmation({ isOpen: false })}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              إلغاء الأمر
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              {deleteConfirmation.isPermanent ? "حذف نهائي" : "نقل للأرشيف"}
            </button>
          </div>
        </div>
      </Modal>
      <Footer />
    </div>
  );
};

export default App;
