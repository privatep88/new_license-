
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import type { Procedure, RecordDataType } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ExportIcon, PhoneIcon, MailIcon, GlobeIcon, UserIcon, KeyIcon, CopyIcon, CheckIcon, DocumentIcon, PdfIcon, WordIcon, ExcelIcon, PowerPointIcon } from './icons/ActionIcons';
import { ProcedureIcon } from './icons/TabIcons';

interface ProceduresManagementProps {
    procedures: Procedure[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: Procedure, type: RecordDataType) => void;
    onDelete: (item: Procedure, type: RecordDataType) => void;
}

const CopyableField: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between group bg-white p-1.5 rounded border border-gray-100 hover:border-blue-100 transition-colors">
      <div className="flex items-center gap-2 text-sm overflow-hidden">
        <span className="text-gray-400 flex-shrink-0">{icon}</span>
        <span className="font-medium text-gray-600 flex-shrink-0">{label}:</span>
        <span className="text-gray-800 font-mono truncate dir-ltr select-all">{value}</span>
      </div>
      <button onClick={handleCopy} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1" aria-label={`Copy ${label}`}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
};


const ProceduresManagement: React.FC<ProceduresManagementProps> = ({ procedures, onAdd, onEdit, onDelete }) => {
  
  const handleExport = () => {
      const exportData = procedures.map(p => ({
        'اسم الخدمة': p.licenseName,
        'الجهة المعنية للمراجعة': p.authority,
        'ارقام التواصل': p.contactNumbers,
        'البريد الالكتروني': p.email,
        'اسم الموظف': p.employeeName || '',
        'رقم الموظف': p.employeeNumber || '',
        'المتطلبات': p.requirements || '',
        'اسم الموقع الالكتروني': p.websiteName,
        'عنوان الموقع الالكتروني': p.websiteUrl,
        'اسم المستخدم': p.username,
        'كلمة المرور': p.password,
        'الملاحظات': p.notes || '',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-fit column widths
      ws['!cols'] = [
        { wch: 30 }, // اسم الخدمة
        { wch: 35 }, // الجهة المعنية
        { wch: 20 }, // ارقام التواصل
        { wch: 25 }, // البريد
        { wch: 20 }, // اسم الموظف
        { wch: 15 }, // رقم الموظف
        { wch: 50 }, // المتطلبات
        { wch: 25 }, // اسم الموقع
        { wch: 35 }, // عنوان الموقع
        { wch: 20 }, // المستخدم
        { wch: 20 }, // المرور
        { wch: 40 }, // الملاحظات
      ];

      // Fix: Set Sheet Direction to Right-to-Left
      if(!ws['!views']) ws['!views'] = [];
      ws['!views'].push({ rightToLeft: true });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Procedures");

      XLSX.writeFile(wb, `الإجراءات والمتطلبات.xlsx`);
  };

  const titleStyle = "flex items-center gap-3 px-5 py-2.5 bg-[#091526] text-white rounded-xl border-r-4 border-[#eab308] shadow-md hover:shadow-lg transition-all duration-300";

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-col gap-2">
            <div className={titleStyle}>
                <span className="text-[#eab308]"><ProcedureIcon /></span>
                <span className="font-bold text-lg tracking-wide">الإجراءات والمتطلبات</span>
                <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{procedures.length}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1 pr-2">
                 لتجديد الرخص / الأنشطة / العقود / الشهادات / الوكالات - والمواضيع الأخرى
            </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-center">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white text-blue-700 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-sm font-medium"
            >
              <ExportIcon />
              <span>Excel</span>
            </button>
            <button
              onClick={() => onAdd('procedure')}
              className="flex items-center gap-2 bg-[#334155] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors shadow-sm text-sm font-medium"
            >
              <PlusIcon />
              <span>إضافة جديد</span>
            </button>
        </div>
      </div>

      {procedures.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {procedures.map(proc => (
            <div key={proc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                {/* Card Header */}
                <div className="bg-slate-50 p-5 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-[#1d4ed8] leading-snug">{proc.licenseName}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 font-medium">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {proc.authority}
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => onEdit(proc, 'procedure')} className="p-2 bg-white border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all" aria-label="تعديل"><PencilIcon /></button>
                         <button onClick={() => onDelete(proc, 'procedure')} className="p-2 bg-white border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-all" aria-label="حذف"><TrashIcon /></button>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow space-y-6">
                    {(proc.contactNumbers || proc.email || proc.employeeName || proc.employeeNumber) && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">معلومات التواصل</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {proc.contactNumbers && <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded"><PhoneIcon /><span dir="ltr">{proc.contactNumbers}</span></div>}
                                {proc.email && <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded"><MailIcon /><a href={`mailto:${proc.email}`} className="text-blue-600 hover:underline truncate">{proc.email}</a></div>}
                                {proc.employeeName && <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded"><UserIcon /><span>{proc.employeeName}</span></div>}
                                {proc.employeeNumber && <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded"><UserIcon /><span className="text-gray-400">#</span><span>{proc.employeeNumber}</span></div>}
                            </div>
                        </div>
                    )}

                    {(proc.websiteName || proc.websiteUrl || proc.username || proc.password) && (
                        <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">بيانات الدخول</h4>
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                     <span className="font-semibold text-gray-700">{proc.websiteName || 'الموقع الالكتروني'}</span>
                                     {proc.websiteUrl && <a href={proc.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><GlobeIcon /></a>}
                                </div>
                                {proc.username && <CopyableField label="المستخدم" value={proc.username} icon={<UserIcon />} />}
                                {proc.password && <CopyableField label="المرور" value={proc.password} icon={<KeyIcon />} />}
                            </div>
                        </div>
                    )}

                    {proc.requirements && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">المتطلبات</h4>
                            <div className="text-sm text-gray-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100 whitespace-pre-line leading-relaxed">
                                {proc.requirements}
                            </div>
                        </div>
                    )}

                    {proc.notes && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ملاحظات</h4>
                            <div className="text-sm text-gray-700 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 whitespace-pre-line leading-relaxed">
                                {proc.notes}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Card Footer for Attachments */}
                {proc.attachments && proc.attachments.length > 0 && (
                    <div className="px-5 py-4 mt-auto border-t border-gray-100 bg-gray-50/30">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">المرفقات</h4>
                        <div className="flex flex-wrap gap-2">
                        {proc.attachments.map((att, index) => (
                             <a key={index} href={att.data} target="_blank" rel="noopener noreferrer" title={att.name || 'عرض الملف'} className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-colors p-1.5 pr-3 rounded-md shadow-sm">
                                {(() => {
                                    const type = (att.type || '').toLowerCase();
                                    const name = (att.name || '').toLowerCase();

                                    if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp)$/)) { return <img src={att.data} alt="img" className="h-6 w-6 object-cover rounded flex-shrink-0" />; }
                                    if (type.includes('pdf') || name.endsWith('.pdf')) { return <div className="h-6 w-6"><PdfIcon /></div>; }
                                    if (type.includes('word') || type.includes('document') || name.match(/\.(doc|docx)$/)) { return <div className="h-6 w-6"><WordIcon /></div>; }
                                    if (type.includes('excel') || type.includes('sheet') || type.includes('spreadsheet') || name.match(/\.(xls|xlsx|csv)$/)) { return <div className="h-6 w-6"><ExcelIcon /></div>; }
                                    if (type.includes('powerpoint') || type.includes('presentation') || name.match(/\.(ppt|pptx)$/)) { return <div className="h-6 w-6"><PowerPointIcon /></div>; }
                                    
                                    return <div className="h-6 w-6"><DocumentIcon /></div>;
                                })()}
                                 <span className="truncate max-w-[150px]">{att.name || 'ملف'}</span>
                             </a>
                        ))}
                        </div>
                    </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
            <ProcedureIcon />
            <p className="mt-4 text-lg font-medium">لا توجد إجراءات مسجلة حالياً</p>
            <p className="mt-1 text-sm">انقر على "إضافة جديد" لبدء إضافة السجلات الخاصة بالخدمات والجهات الحكومية.</p>
        </div>
      )}
    </div>
  );
};

export default ProceduresManagement;
