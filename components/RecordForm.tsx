
import React, { useState, useEffect } from 'react';
import type { License, Contract, RecordType, RecordDataType, Procedure, Attachment } from '../types';
import { RecordStatus, RenewalType, ContractType } from '../types';
import { DocumentIcon, PdfIcon, WordIcon, ExcelIcon, PowerPointIcon } from './icons/ActionIcons';

interface RecordFormProps {
  initialData?: RecordType;
  type: RecordDataType;
  onSave: (record: RecordType) => void;
  onCancel: () => void;
}

const FormField: React.FC<{ label: string; htmlFor: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
    <div className="mb-4">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {/* Clone element to add id prop for accessibility */}
        {React.cloneElement(children as React.ReactElement<any>, { id: htmlFor })}
    </div>
);

const commonInputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl shadow-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm text-gray-900 transition-all";

const FilePreviewIcon: React.FC<{ type: string, name: string }> = ({ type, name }) => {
    const iconContainerClass = "h-12 w-12 flex items-center justify-center bg-gray-100 rounded-md flex-shrink-0";
    
    const t = (type || '').toLowerCase();
    const n = (name || '').toLowerCase();

    if (t === 'application/pdf' || n.endsWith('.pdf')) return <div className={iconContainerClass}><PdfIcon /></div>;
    if (t.includes('word') || t.includes('document') || n.match(/\.(doc|docx)$/)) return <div className={iconContainerClass}><WordIcon /></div>;
    if (t.includes('excel') || t.includes('sheet') || t.includes('spreadsheet') || n.match(/\.(xls|xlsx|csv)$/)) return <div className={iconContainerClass}><ExcelIcon /></div>;
    if (t.includes('powerpoint') || t.includes('presentation') || n.match(/\.(ppt|pptx)$/)) return <div className={iconContainerClass}><PowerPointIcon /></div>;
    
    return <div className={iconContainerClass}><DocumentIcon /></div>;
};

const getReadableFileType = (name: string, type: string): string => {
    const n = (name || '').toLowerCase();
    const t = (type || '').toLowerCase();
    
    if (t.includes('pdf') || n.endsWith('.pdf')) return 'ملف PDF';
    if (t.includes('word') || t.includes('document') || n.match(/\.(doc|docx)$/)) return 'مستند Word';
    if (t.includes('excel') || t.includes('sheet') || t.includes('spreadsheet') || n.match(/\.(xls|xlsx|csv)$/)) return 'ملف Excel';
    if (t.includes('powerpoint') || t.includes('presentation') || n.match(/\.(ppt|pptx)$/)) return 'عرض PowerPoint';
    if (t.startsWith('image/') || n.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'صورة';
    
    return 'ملف';
};

const RecordForm: React.FC<RecordFormProps> = ({ initialData, type, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<RecordType>>(initialData || {});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type: inputType } = e.target;
    
    // Special handling for contractType change to manage date fields
    if (name === 'contractType') {
        setFormData(prev => {
            const updated = { ...prev, contractType: value as ContractType } as Partial<Contract>;
            // Clear irrelevant date and cost fields to prevent submitting stale data
            if (value === ContractType.Documented) {
                updated.internalExpiryDate = '';
                updated.internalCost = undefined;
            } else if (value === ContractType.Internal) {
                updated.documentedExpiryDate = '';
                updated.documentedCost = undefined;
            }
            return updated;
        });
        return; 
    }

    // General handling for other inputs
    const isNumber = inputType === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filePromises = Array.from(files).map((file: File) => {
        return new Promise<Attachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    data: reader.result as string,
                    name: file.name,
                    type: file.type
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    Promise.all(filePromises).then(newAttachments => {
        setFormData(prev => {
            const existingAttachments = (prev as any).attachments || [];
            return {
                ...prev,
                attachments: [...existingAttachments, ...newAttachments]
            };
        });
    });
  };
  
  const handleRemoveAttachment = (indexToRemove: number) => {
    setFormData(prev => {
        const currentAttachments = (prev as any).attachments || [];
        return {
            ...prev,
            attachments: currentAttachments.filter((_: any, index: number) => index !== indexToRemove)
        };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as RecordType);
  };
  
  const attachmentData = formData as Partial<License | Contract | Procedure>;

  const attachmentField = (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">المرفقات</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
            <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>اختر ملفات</span>
                        <input
                            id="file-upload"
                            name="attachment-input"
                            type="file"
                            className="sr-only"
                            multiple
                            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                            onChange={handleFileChange}
                        />
                    </label>
                    <p className="pr-1">أو اسحبها هنا</p>
                </div>
                <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, XLS, PPT, PNG, JPG up to 10MB
                </p>
            </div>
        </div>

        {attachmentData.attachments && attachmentData.attachments.length > 0 && (
            <div className="mt-4 space-y-3">
                {attachmentData.attachments.map((att, index) => (
                     <div key={index} className="flex items-center justify-between gap-4 p-2 border rounded-md bg-gray-50">
                        <a href={att.data} target="_blank" rel="noopener noreferrer" title={`عرض ${att.name}`} className="flex items-center gap-4 flex-grow min-w-0">
                          {(att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
                              <img src={att.data} alt="Preview" className="h-12 w-12 object-cover rounded-md border" />
                          ) : (
                              <FilePreviewIcon type={att.type} name={att.name} />
                          )}
                          <div className="flex-grow min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate hover:underline">{att.name}</p>
                              <p className="text-xs text-gray-500">{getReadableFileType(att.name, att.type)}</p>
                          </div>
                        </a>
                        <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex-shrink-0"
                        >
                            حذف
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const renderLicenseFields = (data: Partial<License>) => (
    <>
      <FormField label={
          type === 'specialAgency' ? "اسم الوكالة" :
          type === 'operationalLicense' ? "الموضوع" :
          type === 'civilDefenseCert' ? "الموضوع" :
          type === 'otherTopic' ? "الموضوع" :
          type === 'generalContract' ? "اسم العقد العام" :
          type === 'trademarkCert' ? "اسم الشهادة" :
          "اسم الرخصة"
      } htmlFor="name">
          <input type="text" name="name" value={data.name || ''} onChange={handleChange} className={commonInputClass} required />
      </FormField>
      <FormField label={
          type === 'operationalLicense' ? "الرقم" :
          type === 'civilDefenseCert' ? "الرقم" :
          type === 'specialAgency' ? "رقم المصادقة" :
          type === 'otherTopic' ? "الرقم" :
          type === 'generalContract' ? "رقم العقد" :
          type === 'trademarkCert' ? "رقم الشهادة" :
          "رقم الرخصة"
      } htmlFor="number">
        <input type="text" name="number" value={data.number || ''} onChange={handleChange} className={commonInputClass} required />
      </FormField>
      
      {type === 'trademarkCert' && (
        <FormField label="تاريخ التسجيل" htmlFor="registrationDate">
          <input type="date" name="registrationDate" value={data.registrationDate || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="تاريخ الانتهاء" htmlFor="expiryDate">
          <input type="date" name="expiryDate" value={data.expiryDate || ''} onChange={handleChange} className={commonInputClass} required />
        </FormField>
         <FormField label="التكلفة" htmlFor="cost">
          <input type="number" name="cost" value={data.cost || ''} onChange={handleChange} className={commonInputClass} required />
        </FormField>
      </div>
      {type === 'generalContract' && (
        <FormField label="نوع التجديد" htmlFor="renewalType">
            <select name="renewalType" value={data.renewalType || ''} onChange={handleChange} className={commonInputClass} required>
                <option value="" disabled>اختر النوع</option>
                {Object.values(RenewalType).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </FormField>
      )}
      <FormField label="الملاحظات" htmlFor="notes">
        <textarea name="notes" value={data.notes || ''} onChange={handleChange} className={commonInputClass} rows={3}></textarea>
      </FormField>
    </>
  );

  const renderContractFields = (data: Partial<Contract>) => (
    <>
        <FormField label="اسم العقد" htmlFor="name">
            <input type="text" name="name" value={data.name || ''} onChange={handleChange} className={commonInputClass} required />
        </FormField>
        <FormField label="رقم العقد" htmlFor="number">
            <input type="text" name="number" value={data.number || ''} onChange={handleChange} className={commonInputClass} required />
        </FormField>
        <FormField label="نوع العقد" htmlFor="contractType">
            <select name="contractType" value={data.contractType || ''} onChange={handleChange} className={commonInputClass} required>
                <option value="">اختر النوع</option>
                {Object.values(ContractType).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </FormField>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            { (data.contractType === ContractType.Documented || data.contractType === ContractType.DocumentedAndInternal) &&
                <FormField label="تاريخ انتهاء العقد الموثق" htmlFor="documentedExpiryDate">
                  <input type="date" name="documentedExpiryDate" value={data.documentedExpiryDate || ''} onChange={handleChange} className={commonInputClass} required={data.contractType === ContractType.Documented || data.contractType === ContractType.DocumentedAndInternal} />
                </FormField>
            }
            { (data.contractType === ContractType.Internal || data.contractType === ContractType.DocumentedAndInternal) &&
                <FormField label="تاريخ انتهاء العقد البيني" htmlFor="internalExpiryDate">
                  <input type="date" name="internalExpiryDate" value={data.internalExpiryDate || ''} onChange={handleChange} className={commonInputClass} required={data.contractType === ContractType.Internal || data.contractType === ContractType.DocumentedAndInternal} />
                </FormField>
            }
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            { (data.contractType === ContractType.Documented || data.contractType === ContractType.DocumentedAndInternal) &&
                <FormField label="تكلفة العقد الموثق" htmlFor="documentedCost">
                    <input type="number" name="documentedCost" value={data.documentedCost || ''} onChange={handleChange} className={commonInputClass} required={data.contractType === ContractType.Documented || data.contractType === ContractType.DocumentedAndInternal} />
                </FormField>
            }
            { (data.contractType === ContractType.Internal || data.contractType === ContractType.DocumentedAndInternal) &&
                <FormField label="تكلفة العقد البيني" htmlFor="internalCost">
                    <input type="number" name="internalCost" value={data.internalCost || ''} onChange={handleChange} className={commonInputClass} required={data.contractType === ContractType.Internal || data.contractType === ContractType.DocumentedAndInternal} />
                </FormField>
            }
        </div>

        <FormField label="الملاحظات" htmlFor="notes">
            <textarea name="notes" value={data.notes || ''} onChange={handleChange} className={commonInputClass} rows={3}></textarea>
        </FormField>
    </>
  );

  const renderProcedureFields = (data: Partial<Procedure>) => (
    <>
      <FormField label="اسم الخدمة" htmlFor="licenseName">
        <input type="text" name="licenseName" value={data.licenseName || ''} onChange={handleChange} className={commonInputClass} required />
      </FormField>
      <FormField label="الجهة المعنية للمراجعة" htmlFor="authority">
        <input type="text" name="authority" value={data.authority || ''} onChange={handleChange} className={commonInputClass} required />
      </FormField>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="ارقام التواصل" htmlFor="contactNumbers">
          <input type="text" name="contactNumbers" value={data.contactNumbers || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
        <FormField label="البريد الالكتروني" htmlFor="email">
          <input type="email" name="email" value={data.email || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="اسم الموظف ( إن وجد)" htmlFor="employeeName">
          <input type="text" name="employeeName" value={data.employeeName || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
        <FormField label="رقم الموظف" htmlFor="employeeNumber">
          <input type="text" name="employeeNumber" value={data.employeeNumber || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="اسم الموقع الالكتروني" htmlFor="websiteName">
          <input type="text" name="websiteName" value={data.websiteName || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
        <FormField label="عنوان الموقع الالكتروني (URL)" htmlFor="websiteUrl">
          <input type="url" name="websiteUrl" value={data.websiteUrl || ''} onChange={handleChange} className={commonInputClass} placeholder="https://example.com" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="اسم المستخدم" htmlFor="username">
          <input type="text" name="username" value={data.username || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
        <FormField label="كلمة المرور" htmlFor="password">
          <input type="text" name="password" value={data.password || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
      </div>
       <FormField label="المتطلبات" htmlFor="requirements">
        <textarea name="requirements" value={data.requirements || ''} onChange={handleChange} className={commonInputClass} rows={3}></textarea>
      </FormField>
      <FormField label="الملاحظات" htmlFor="notes">
        <textarea name="notes" value={data.notes || ''} onChange={handleChange} className={commonInputClass} rows={3}></textarea>
      </FormField>
    </>
  );


  const renderFields = () => {
    switch(type) {
      case 'leaseContract':
        return renderContractFields(formData as Partial<Contract>);
      case 'procedure':
        return renderProcedureFields(formData as Partial<Procedure>);
      default:
        return renderLicenseFields(formData as Partial<License>);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6">
      {renderFields()}
      {attachmentField}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white/95 backdrop-blur-xs z-10">
        <button 
          type="button" 
          onClick={onCancel} 
          className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium min-h-[44px] transition-colors"
        >
          إلغاء الأمر
        </button>
        <button 
          type="submit" 
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm min-h-[44px] transition-colors"
        >
          حفظ
        </button>
      </div>
    </form>
  );
};

export default RecordForm;
