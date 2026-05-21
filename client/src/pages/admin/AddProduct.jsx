import  { useState, useEffect } from 'react';
import { ChevronLeft, Save, X, Image as ImageIcon, Plus, RefreshCw, Package, Tag, ChevronDown, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { fetchCategories } from '../../store/slices/categorySlice'
import { setGlobalLoading } from '../../store/slices/loadingSlice';

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { schemas, loading: schemaLoading } = useSelector((state) => state.formSchema);
  const { items: categories, loading: categoriesLoading } = useSelector((state) => state.category);
  
  const productSchema = schemas?.product;
  const fields = productSchema?.fields || [];

  const [formData, setFormData] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (fields.length > 0) {
      const initialData = {};
      fields.forEach(field => {
        initialData[field.name] = field.defaultValue || '';
      });
      setFormData(initialData);
    }
  }, [fields]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files, "productImage");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      handleFiles(files, name);
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFiles = (files, fieldName) => {
    const newFiles = Array.from(files);
    
    setFormData(prev => {
      const currentFiles = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      return { ...prev, [fieldName]: [...currentFiles, ...newFiles] };
    });

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setFilePreviews(prev => {
      const currentPreviews = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      return { ...prev, [fieldName]: [...currentPreviews, ...newPreviews] };
    });
  };

  const removeFile = (fieldName, index) => {
    setFormData(prev => {
      const updatedFiles = [...prev[fieldName]];
      updatedFiles.splice(index, 1);
      return { ...prev, [fieldName]: updatedFiles };
    });

    setFilePreviews(prev => {
      const updatedPreviews = [...prev[fieldName]];
      URL.revokeObjectURL(updatedPreviews[index]);
      updatedPreviews.splice(index, 1);
      return { ...prev, [fieldName]: updatedPreviews };
    });
  };

  const moveFile = (fieldName, index, direction) => {
    const toIndex = direction === 'left' ? index - 1 : index + 1;
    
    setFormData(prev => {
      const updatedFiles = [...prev[fieldName]];
      const fileToMove = updatedFiles[index];
      updatedFiles.splice(index, 1);
      updatedFiles.splice(toIndex, 0, fileToMove);
      return { ...prev, [fieldName]: updatedFiles };
    });

    setFilePreviews(prev => {
      const updatedPreviews = [...prev[fieldName]];
      const previewToMove = updatedPreviews[index];
      updatedPreviews.splice(index, 1);
      updatedPreviews.splice(toIndex, 0, previewToMove);
      return { ...prev, [fieldName]: updatedPreviews };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      const value = formData[field.name];
      const validation = field.validation || {};

      if (validation.required && (!value || (Array.isArray(value) ? value.length === 0 : value === ''))) {
        newErrors[field.name] = validation.errorMessage || `${field.label} is required`;
      } else if (field.type === 'number' && validation.min !== undefined && value < validation.min) {
        newErrors[field.name] = `Minimum value is ${validation.min}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Please fix the errors in the form");
    
    dispatch(setGlobalLoading(true));

    const submissionData = new FormData();
    fields.forEach(field => {
      const value = formData[field.name];
      if (value !== null && value !== undefined) {
        if (field.type === 'file' && Array.isArray(value)) {
          value.forEach(file => {
            submissionData.append(field.name, file);
          });
        } else {
          submissionData.append(field.name, value);
        }
      }
    });

    try {
      await api.post("/product", submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Product created successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };

  const renderInput = (field) => {
    const commonProps = {
      name: field.name,
      value: (field.type !== 'file' && field.type !== 'checkbox') ? formData[field.name] || '' : undefined,
      onChange: handleInputChange,
      placeholder: field.placeholder,
      className: `w-full bg-slate-50 border ${errors[field.name] ? 'border-rose-400 focus:border-rose-500 ring-rose-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5'} rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white transition-all`
    };

    if (field.type === 'textarea') {
      return (
        <textarea {...commonProps} rows="6" className={commonProps.className + " resize-none"} />
      );
    }

    if (field.type === 'select') {
      const options = field.name === 'category' ? categories : (field.options || []);
      const isLoading = field.name === 'category' && categoriesLoading;

      return (
        <div className="relative">
          <select 
            {...commonProps} 
            className={commonProps.className + " appearance-none cursor-pointer"}
            disabled={isLoading}
          >
            <option value="">{isLoading ? 'Loading Options...' : field.placeholder}</option>
            {options.map(opt => (
              <option key={opt._id || opt.value || opt} value={opt._id || opt.value || opt}>{opt.name || opt.label || opt}</option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
            {isLoading ? <RefreshCw size={16} className="animate-spin text-indigo-500" /> : <ChevronDown size={18} />}
          </div>
        </div>
      );
    }

    if (field.type === 'radio') {
      const options = field.options || [];
      return (
        <div className="flex flex-wrap gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mt-1">
          {options.map(opt => (
            <label key={opt.value || opt} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name={field.name} 
                  value={opt.value || opt} 
                  checked={formData[field.name] == (opt.value || opt)}
                  onChange={handleInputChange}
                  className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-full checked:border-indigo-600 transition-all cursor-pointer bg-white"
                />
                <div className="w-3 h-3 bg-indigo-600 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity absolute pointer-events-none"></div>
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-all">{opt.label || opt}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <label className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer group hover:bg-white hover:border-indigo-100 transition-all mt-1">
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              name={field.name} 
              checked={!!formData[field.name]}
              onChange={handleInputChange}
              className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-lg checked:border-indigo-600 checked:bg-indigo-600 transition-all cursor-pointer bg-white"
            />
            <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-all">{field.placeholder || "Enable Item"}</span>
        </label>
      );
    }

    if (field.type === 'file') {
      const previews = filePreviews[field.name] || [];
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group aspect-square rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <img src={preview} alt="Preview" className="w-full h-full object-contain p-2 rounded-2xl" />
                
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-md shadow-lg z-10">
                    Main
                  </div>
                )}

                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   {index > 0 && (
                     <button
                       type="button"
                       onClick={() => moveFile(field.name, index, 'left')}
                       className="p-2 bg-white rounded-xl text-slate-900 hover:text-indigo-600 active:scale-90 transition-all shadow-sm"
                     >
                       <ArrowLeft size={14} strokeWidth={3} />
                     </button>
                   )}
                   {index < previews.length - 1 && (
                     <button
                       type="button"
                       onClick={() => moveFile(field.name, index, 'right')}
                       className="p-2 bg-white rounded-xl text-slate-900 hover:text-indigo-600 active:scale-90 transition-all shadow-sm"
                     >
                       <ArrowRight size={14} strokeWidth={3} />
                     </button>
                   )}
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(field.name, index)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg text-rose-600 shadow-xl active:scale-90 z-20"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
            
            {previews.length < 5 && (
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-50 text-indigo-500 scale-105" 
                    : "border-slate-200 bg-slate-50 text-slate-300 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30"
                }`}
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <ImageIcon size={28} className="group-hover:text-indigo-600 transition-colors" />
                </div>
                <span className="text-[10px] font-black mt-3 uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                  {isDragging ? "Drop Here" : previews.length === 0 ? "Drop Images" : "Add More"}
                </span>
                <input type="file" className="hidden" name={field.name} onChange={handleInputChange} accept="image/*" multiple />
              </label>
            )}
          </div>
        </div>
      );
    }

    return (
      <input 
        {...commonProps} 
        type={field.type} 
        className={field.name === 'price' ? commonProps.className + " pl-12 text-xl font-black text-indigo-600" : commonProps.className} 
      />
    );
  };

  if (schemaLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw size={40} className="animate-spin text-indigo-600" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Hydrating Form Configurations...</p>
      </div>
    );
  }

  const assetFields = fields.filter(f => f.type === 'file');
  const valuationFields = fields.filter(f => f.type === 'number');
  const classificationFields = fields.filter(f => ['select', 'radio', 'checkbox'].includes(f.type));
  const mainFields = fields.filter(f => !assetFields.includes(f) && !valuationFields.includes(f) && !classificationFields.includes(f));

  return (
    <div className="max-w-screen space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl text-slate-500 shadow-sm border border-slate-200 transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
              Add New Product
            </h1>
            <p className="text-slate-500 text-sm font-bold flex items-center gap-2">
              <Plus size={14} className="text-indigo-600" />
              Dynamic Schema Powered Form
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info Columns */}
          <div className="lg:col-span-8 space-y-8">
            {mainFields.length > 0 && (
              <div className="admin-card space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
                    <Package size={14} /> General Information
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {mainFields.map(field => (
                      <div key={field.name} className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                          {field.label}
                          {errors[field.name] && <span className="text-rose-500 lowercase italic">{errors[field.name]}</span>}
                        </label>
                        {renderInput(field)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {valuationFields.length > 0 && (
              <div className="admin-card space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <Tag size={14} /> Currency & Valuation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {valuationFields.map(field => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                        {field.label}
                        {errors[field.name] && <span className="text-rose-500 lowercase italic">{errors[field.name]}</span>}
                      </label>
                      <div className="relative">
                        {field.name === 'price' && <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">$</span>}
                        {renderInput(field)}
                      </div>
                    </div>
                  ))}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Market Strategy</p>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed italic">The price should reflect current market demand.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Columns */}
          <div className="lg:col-span-4 space-y-8">
            {classificationFields.length > 0 && (
              <div className="admin-card space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</h3>
                {classificationFields.map(field => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                      {field.label}
                      {errors[field.name] && <span className="text-rose-500 lowercase italic">{errors[field.name]}</span>}
                    </label>
                    {renderInput(field)}
                  </div>
                ))}
              </div>
            )}

            {assetFields.length > 0 && (
              <div className="admin-card space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Assets</h3>
                {assetFields.map(field => (
                  <div key={field.name} className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                      {field.label}
                      {errors[field.name] && <span className="text-rose-500 lowercase italic">{errors[field.name]}</span>}
                    </label>
                    {renderInput(field)}
                  </div>
                ))}
                <p className="text-[10px] text-slate-400 font-bold italic text-center uppercase tracking-tighter">High-resolution images recommended</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Save size={20} className="relative z-10" />
              <span className="relative z-10">Add Product</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
