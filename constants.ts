
import type { Tab, License, Contract, Procedure } from './types';
import { RecordStatus, RenewalType, ContractType } from './types';
import { DashboardIcon, LicenseIcon, ContractIcon, AgencyIcon, SupplierIcon, OtherTopicsIcon, ProcedureIcon, TrademarkIcon, AllRecordsIcon, ArchiveIcon } from './components/icons/TabIcons';

export const ADMIN_EMAIL = 'admin@example.com'; // Change this to the actual administrator's email

export const TABS: Tab[] = [
  { id: 'licenses', name: 'الرخص التجارية / التشغيلية /الدفاع المدني', icon: LicenseIcon },
  { id: 'contracts', name: 'العقود الايجارية', icon: ContractIcon },
  { id: 'supplierContracts', name: 'عقود الموردين', icon: SupplierIcon },
  { id: 'other', name: 'الوكالات الخاصة', icon: AgencyIcon },
  { id: 'trademarks', name: 'العلامات التجارية المسجلة', icon: TrademarkIcon },
  { id: 'otherTopics', name: 'مواضيع أخرى', icon: OtherTopicsIcon },
  { id: 'allRecords', name: 'جميع السجلات ( إحصائية )', icon: AllRecordsIcon },
  { id: 'procedures', name: 'الإجراءات والمتطلبات', icon: ProcedureIcon },
  { id: 'dashboard', name: 'لوحة المعلومات', icon: DashboardIcon },
  { id: 'archive', name: 'أرشيف السجلات', icon: ArchiveIcon },
];

// MOCK DATA - Total Distribution: 10 Active, 5 Soon, 4 Expired
// Active: > 2027
// Soon: 2026
// Expired: 2025 / Early 2026

// 1. Commercial Licenses (3 Total: 1 Active, 1 Soon, 1 Expired)
export const MOCK_COMMERCIAL_LICENSES: License[] = [
    { id: 1, name: 'رخصة تجارية عامة', number: 'CN-1234567', expiryDate: '2027-05-15', status: RecordStatus.Active, cost: 1500, notes: 'سارية المفعول - تجديد بعيد المدى (2027)', attachments: [] },
    { id: 2, name: 'رخصة استيراد وتصدير', number: 'CN-7654321', expiryDate: '2026-03-20', status: RecordStatus.SoonToExpire, cost: 3500, notes: 'قاربت على الانتهاء (2026)', attachments: [] },
    { id: 3, name: 'رخصة صناعية', number: 'CN-2468135', expiryDate: '2025-11-01', status: RecordStatus.Expired, cost: 5000, notes: 'منتهية (2025) - يجب التجديد', attachments: [] },
];

// 2. Operational Licenses (2 Total: 1 Active, 1 Expired)
export const MOCK_OPERATIONAL_LICENSES: License[] = [
    { id: 1, name: 'رخصة تشغيل معدات ثقيلة', number: 'OP-987654', expiryDate: '2027-08-20', status: RecordStatus.Active, cost: 800, notes: 'سارية (2027)', attachments: [] },
    { id: 2, name: 'رخصة تشغيل رافعة شوكية', number: 'OP-123987', expiryDate: '2025-10-15', status: RecordStatus.Expired, cost: 950, notes: 'انتهت في 2025', attachments: [] },
];

// 3. Civil Defense (2 Total: 1 Active, 1 Soon)
export const MOCK_CIVIL_DEFENSE_CERTS: License[] = [
    { id: 1, name: 'شهادة إنجاز مبنى', number: 'CD-CERT-001', expiryDate: '2028-01-01', status: RecordStatus.Active, cost: 1200, notes: 'فحص سنوي مطلوب (2028)', attachments: [] },
    { id: 2, name: 'شهادة سلامة معدات', number: 'CD-CERT-002', expiryDate: '2026-04-10', status: RecordStatus.SoonToExpire, cost: 1200, notes: 'تجديد قريب (2026)', attachments: [] },
];

// 4. Special Agencies (2 Total: 1 Active, 1 Soon)
export const MOCK_SPECIAL_AGENCIES: License[] = [
    { id: 1, name: 'وكالة خاصة لفرع دبي', number: 'AUTH-DXB-01', expiryDate: '2027-02-01', status: RecordStatus.Active, cost: 500, notes: 'سارية', attachments: [] },
    { id: 2, name: 'وكالة مراجعة الدوائر الحكومية', number: 'AUTH-GOV-02', expiryDate: '2026-02-15', status: RecordStatus.SoonToExpire, cost: 750, notes: 'تنتهي بداية 2026', attachments: [] },
];

// 5. Lease Contracts (3 Total: 2 Active, 1 Expired)
export const MOCK_LEASE_CONTRACTS: Contract[] = [
    { id: 1, name: 'عقد إيجار المكتب الرئيسي', number: 'LC-HQ-001', internalExpiryDate: '2027-12-31', documentedExpiryDate: '2027-12-31', contractType: ContractType.DocumentedAndInternal, status: RecordStatus.Active, documentedCost: 200000, internalCost: 50000, notes: 'عقد طويل الأمد', attachments: [] },
    { id: 2, name: 'عقد إيجار المستودع', number: 'LC-WH-002', internalExpiryDate: '', documentedExpiryDate: '2025-01-01', contractType: ContractType.Documented, status: RecordStatus.Expired, documentedCost: 120000, notes: 'منتهي منذ فترة', attachments: [] },
    { id: 3, name: 'عقد خدمات النظافة', number: 'SC-CL-003', internalExpiryDate: '2028-06-30', documentedExpiryDate: '', contractType: ContractType.Internal, status: RecordStatus.Active, internalCost: 60000, notes: 'ساري حتى منتصف 2028', attachments: [] },
];

// 6. General Contracts (2 Total: 1 Active, 1 Soon)
export const MOCK_GENERAL_CONTRACTS: License[] = [
    { id: 1, name: 'عقد توريد أثاث مكتبي', number: 'SC-GEN-001', expiryDate: '2027-07-20', status: RecordStatus.Active, renewalType: RenewalType.Manual, cost: 45000, notes: 'مراجعة الأسعار سنويا', attachments: [] },
    { id: 2, name: 'عقد خدمات تسويقية', number: 'SC-GEN-002', expiryDate: '2026-05-25', status: RecordStatus.SoonToExpire, renewalType: RenewalType.Automatic, cost: 120000, notes: 'تجديد تلقائي في 2026', attachments: [] },
];

// 7. Trademark Certs (2 Total: 1 Active, 1 Soon)
export const MOCK_TRADEMARK_CERTS: License[] = [
    { id: 1, name: 'شهادة تسجيل العلامة التجارية (الشعار)', number: 'TM-001', registrationDate: '2020-01-01', expiryDate: '2030-01-01', status: RecordStatus.Active, cost: 5000, notes: 'تجديد بعيد المدى', attachments: [] },
    { id: 2, name: 'شهادة الاسم التجاري', number: 'TM-002', registrationDate: '2020-06-15', expiryDate: '2026-01-20', status: RecordStatus.SoonToExpire, cost: 2000, notes: 'تنتهي قريباً (2026)', attachments: [] },
];

// 8. Other Topics (3 Total: 2 Active, 1 Expired)
export const MOCK_OTHER_TOPICS: License[] = [
    { id: 1, name: 'تصريح مواقف الموظفين السنوي', number: 'PRK-001', expiryDate: '2027-05-15', status: RecordStatus.Active, cost: 250, notes: 'تجديد سنوي', attachments: [] },
    { id: 2, name: 'اشتراك بريد واصل', number: 'PO-BOX-456', expiryDate: '2027-09-01', status: RecordStatus.Active, cost: 300, notes: '', attachments: [] },
    { id: 3, name: 'عضوية غرفة التجارة', number: 'MEM-789', expiryDate: '2025-12-01', status: RecordStatus.Expired, cost: 2200, notes: 'منتهية بنهاية 2025', attachments: [] },
];

export const MOCK_PROCEDURES: Procedure[] = [
    { id: 1, licenseName: 'رخصة تجارية عامة - دبي', authority: 'دائرة التنمية الاقتصادية - دبي', contactNumbers: '600-545-555', email: 'info@dubaided.gov.ae', websiteName: 'DED Dubai eServices', websiteUrl: 'https://eservices.dubaided.gov.ae', username: 'saaed_user', password: 'password@123', notes: 'يتم التجديد إلكترونياً بالكامل', employeeName: 'أحمد المحمود', employeeNumber: 'EMP-001', requirements: '1. نسخة من الرخصة القديمة\n2. شهادة عدم ممانعة', attachments: [] },
    { id: 2, licenseName: 'رخصة الدفاع المدني - أبوظبي', authority: 'الادارة العامة للدفاع المدني - أبوظبي', contactNumbers: '997', email: 'info@adcd.gov.ae', websiteName: 'ADCD Portal', websiteUrl: 'https://adcd.gov.ae', username: 'admin_saaed', password: 'secure_password', notes: 'يتطلب فحص ميداني سنوي قبل التجديد', employeeName: '', employeeNumber: '', requirements: 'مخطط المبنى المعتمد', attachments: [] },
];
