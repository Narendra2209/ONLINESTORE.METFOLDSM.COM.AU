'use client';

import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Clock, AlertTriangle, Loader2, Eye, ArrowRight, X, ChevronDown, ChevronRight, Trash2, Download } from 'lucide-react';

interface ImportJob {
  _id: string;
  fileName: string;
  type: 'products' | 'prices' | 'stock';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; field: string; message: string }>;
  uploadedBy: { firstName: string; lastName: string } | null;
  completedAt: string | null;
  createdAt: string;
}

interface SheetPreview {
  name: string;
  headers: string[];
  rawHeaders: string[];
  totalRows: number;
  sampleRows: Record<string, any>[];
}

interface PreviewData {
  sheets: SheetPreview[];
  totalRows: number;
}

export default function AdminImportsPage() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [importType, setImportType] = useState<'products' | 'prices' | 'stock' | 'cladding' | 'dambuster'>('products');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [expandedSheets, setExpandedSheets] = useState<Set<string>>(new Set());

  // Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStage, setImportStage] = useState<'uploading' | 'processing' | ''>('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/imports?page=${page}&limit=10`);
      setJobs(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch {
      toast.error('Failed to load import history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page]);

  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('This will delete the import record AND all products/variants that were imported from this file. Are you sure?')) return;
    try {
      const { data } = await api.delete(`/admin/imports/${jobId}`);
      toast.success(data.message || 'Import and associated data deleted');
      fetchJobs();
    } catch {
      toast.error('Failed to delete import data');
    }
  };

  // Step 1: Preview file
  const handlePreview = async (file: File) => {
    if (!file) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only Excel files (.xlsx, .xls) are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }

    // Cladding / Dambuster import — skip preview, upload directly
    if (importType === 'cladding' || importType === 'dambuster') {
      setPreviewFile(file);
      setImporting(true);
      setImportProgress(0);
      setImportStage('uploading');
      try {
        const formData = new FormData();
        formData.append('file', file);
        const importUrl = importType === 'dambuster' ? '/admin/dambuster/import' : '/admin/cladding/import';
        const { data } = await api.post(importUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 300000,
          onUploadProgress: (progressEvent) => {
            const pct = progressEvent.total ? Math.round((progressEvent.loaded / progressEvent.total) * 100) : 0;
            setImportProgress(pct);
            if (pct >= 100) setImportStage('processing');
          },
        });
        const msg = data.data;
        const label = importType === 'dambuster' ? 'Dambuster' : 'Cladding';
        toast.success(`${label} import done: ${msg?.created || 0} created, ${msg?.updated || 0} updated, ${msg?.errors?.length || 0} errors`);
        if (msg?.errors?.length > 0) {
          console.warn('Cladding import errors:', msg.errors);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Cladding import failed');
      } finally {
        setImporting(false);
        setImportProgress(0);
        setImportStage('');
        setPreviewFile(null);
      }
      return;
    }

    setPreviewing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/admin/imports/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      setPreviewData(data.data);
      setPreviewFile(file);
      // Expand first sheet by default
      if (data.data?.sheets?.length > 0) {
        setExpandedSheets(new Set([data.data.sheets[0].name]));
      }
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to preview file');
    } finally {
      setPreviewing(false);
    }
  };

  // Step 2: Confirm and import
  const handleConfirmImport = async () => {
    if (!previewFile) return;

    setImporting(true);
    setImportProgress(0);
    setImportStage('uploading');

    try {
      const formData = new FormData();
      formData.append('file', previewFile);
      formData.append('type', importType);

      // Cladding / Dambuster panels use separate endpoints
      const uploadUrl = importType === 'cladding' ? '/admin/cladding/import'
        : importType === 'dambuster' ? '/admin/dambuster/import'
        : '/admin/imports/upload';

      const { data } = await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000,
        onUploadProgress: (progressEvent) => {
          const pct = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0;
          setImportProgress(pct);
          if (pct >= 100) {
            setImportStage('processing');
          }
        },
      });

      const msg = data.data;
      if (importType === 'cladding' || importType === 'dambuster') {
        const label = importType === 'dambuster' ? 'Dambuster' : 'Cladding';
        toast.success(`${label} import done: ${msg?.created || 0} created, ${msg?.updated || 0} updated, ${msg?.errors?.length || 0} errors`);
      } else if (msg?.successCount > 0 || msg?.errorCount > 0) {
        toast.success(`Import done: ${msg.successCount} success, ${msg.errorCount} errors`);
      } else {
        toast.success(data.message || 'Import completed');
      }
      setPreviewData(null);
      setPreviewFile(null);
      if (importType !== 'cladding' && importType !== 'dambuster') fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
      setImportProgress(0);
      setImportStage('');
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setPreviewFile(null);
    setExpandedSheets(new Set());
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePreview(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePreview(file);
    e.target.value = '';
  };

  const toggleSheet = (name: string) => {
    setExpandedSheets((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-steel-400" />;
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success' as const;
      case 'failed': return 'danger' as const;
      case 'processing': return 'info' as const;
      default: return 'default' as const;
    }
  };

  const formatCellValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      if (val.result !== undefined) return String(val.result);
      if (val.text !== undefined) return String(val.text);
      return JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-steel-900">Bulk Import</h1>
          <p className="text-sm text-steel-500">Import products, prices, and stock from Excel files</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mt-6 rounded-xl bg-white border border-steel-100 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">Import Type</label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value as any)}
              disabled={importing || previewing}
              className="rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
            >
              <option value="products">Products (Full Import)</option>
              <option value="prices">Prices Only</option>
              <option value="stock">Stock Levels Only</option>
              <option value="cladding">Cladding Panels</option>
              <option value="dambuster">Dambuster Products</option>
            </select>
          </div>
        </div>

        {/* Importing progress */}
        {importing ? (
          <div className="border-2 border-brand-200 bg-brand-50/30 rounded-xl p-8">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Loader2 className="h-12 w-12 text-brand-500 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-steel-900 mb-1">
                {importStage === 'uploading' ? 'Uploading file...' : 'Importing products to database...'}
              </p>
              <p className="text-xs text-steel-500 mb-4">
                {importStage === 'uploading'
                  ? 'Sending your file to the server'
                  : 'Processing rows and saving to database — this may take a while'}
              </p>
              <div className="w-full max-w-sm">
                <div className="h-2.5 w-full rounded-full bg-steel-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: importStage === 'processing' ? '100%' : `${importProgress}%`,
                      background: importStage === 'processing'
                        ? 'linear-gradient(90deg, #0c93e7, #0074c5, #0c93e7)'
                        : '#0074c5',
                      backgroundSize: importStage === 'processing' ? '200% 100%' : 'auto',
                      animation: importStage === 'processing' ? 'shimmer 1.5s linear infinite' : 'none',
                    }}
                  />
                </div>
                <p className="text-center text-xs text-steel-500 mt-2">
                  {importStage === 'uploading'
                    ? `${importProgress}% uploaded`
                    : 'Processing...'}
                </p>
              </div>
            </div>
          </div>
        ) : previewData ? (
          /* Preview display */
          <div className="space-y-4">
            {/* Preview header */}
            <div className="flex items-center justify-between p-4 bg-brand-50 border border-brand-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <Eye className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-steel-900">
                    Preview: {previewFile?.name}
                  </p>
                  <p className="text-xs text-steel-500">
                    {previewData.sheets.length} sheet{previewData.sheets.length !== 1 ? 's' : ''} — {previewData.totalRows} total data rows
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelPreview}
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmImport}
                  leftIcon={<ArrowRight className="h-4 w-4" />}
                  className="btn-shine"
                >
                  Import {previewData.totalRows} Rows
                </Button>
              </div>
            </div>

            {/* Sheet previews */}
            {previewData.sheets.map((sheet) => (
              <div key={sheet.name} className="border border-steel-200 rounded-xl overflow-hidden">
                {/* Sheet header */}
                <button
                  onClick={() => toggleSheet(sheet.name)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-steel-50 hover:bg-steel-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedSheets.has(sheet.name) ? (
                      <ChevronDown className="h-4 w-4 text-steel-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-steel-500" />
                    )}
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-steel-900">{sheet.name}</span>
                    <Badge variant="default">{sheet.totalRows} rows</Badge>
                  </div>
                  <div className="text-xs text-steel-500">
                    {sheet.headers.length} columns
                  </div>
                </button>

                {/* Sheet data table */}
                {expandedSheets.has(sheet.name) && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-steel-50 border-t border-steel-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-steel-500 uppercase tracking-wider sticky left-0 bg-steel-50 border-r border-steel-200">
                            #
                          </th>
                          {sheet.headers.map((header) => (
                            <th key={header} className="px-3 py-2 text-left font-semibold text-steel-500 uppercase tracking-wider whitespace-nowrap">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-steel-100">
                        {sheet.sampleRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-steel-50/50">
                            <td className="px-3 py-2 text-steel-400 font-mono sticky left-0 bg-white border-r border-steel-100">
                              {idx + 1}
                            </td>
                            {sheet.headers.map((header) => (
                              <td key={header} className="px-3 py-2 text-steel-700 whitespace-nowrap max-w-[200px] truncate">
                                {formatCellValue(row[header])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sheet.totalRows > 10 && (
                      <div className="px-4 py-2 bg-steel-50 border-t border-steel-200 text-xs text-steel-500 text-center">
                        Showing first 10 of {sheet.totalRows} rows
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : previewing ? (
          /* Previewing spinner */
          <div className="border-2 border-steel-200 rounded-xl p-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-3" />
              <p className="text-sm font-medium text-steel-700">Reading Excel file...</p>
              <p className="text-xs text-steel-500 mt-1">Parsing sheets and preparing preview</p>
            </div>
          </div>
        ) : (
          /* Upload drop zone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragActive(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-brand-500 bg-brand-50'
                : 'border-steel-200 hover:border-steel-300 hover:bg-steel-50/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className={`mx-auto h-12 w-12 ${dragActive ? 'text-brand-500' : 'text-steel-400'}`} />
            <p className="mt-3 text-sm font-medium text-steel-700">
              Drag and drop an Excel file here
            </p>
            <p className="text-xs text-steel-400 mt-1">or click to browse — .xlsx, .xls up to 50MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              Select File
            </Button>
          </div>
        )}

        {/* Column Requirements — only show when no preview */}
        {!previewData && !previewing && !importing && (
          <div className="mt-4 p-4 bg-steel-50 rounded-lg">
            <p className="text-sm font-medium text-steel-700 mb-2">Import Guide</p>
            {importType === 'products' && (
              <div className="text-xs text-steel-600 space-y-2">
                <div className="p-2 bg-brand-50 rounded-md border border-brand-100 text-brand-800">
                  <strong>Multi-sheet support:</strong> Each sheet in your Excel file will be processed. The sheet name is used as the product category automatically.
                </div>
                <p><strong>Required:</strong> sku</p>
                <p><strong>Recommended:</strong> product_name (or description), base_price</p>
                <p><strong>Optional:</strong> subcategory, description, short_description, material, finish_category, colour, thickness, girth, folds, sump_type, sump_length, sump_width, sump_depth, rib_size, cover_width, length, base_price, pricing_type, stock, minimum_order_qty, tags, status</p>
              </div>
            )}
            {importType === 'prices' && (
              <p className="text-xs text-steel-600"><strong>Required:</strong> sku, base_price. <strong>Optional:</strong> compare_at_price</p>
            )}
            {importType === 'stock' && (
              <p className="text-xs text-steel-600"><strong>Required:</strong> sku, stock</p>
            )}
            {importType === 'cladding' && (
              <div className="text-xs text-steel-600 space-y-2">
                <p><strong>Required columns:</strong> PRODUCT name, MATERIAL, RIB, COVER, base price, SKU</p>
                <p><strong>Optional:</strong> GAUGE, UOM (defaults to LM)</p>
                <p className="text-steel-500">Each row = one variant. Price = base price x length x quantity.</p>
              </div>
            )}
            {importType === 'dambuster' && (
              <div className="text-xs text-steel-600 space-y-2">
                <p><strong>Required columns:</strong> PRODUCT NAME, Inventory (SKU), BASE PRICE</p>
                <p><strong>Recommended:</strong> Material, TYPE (Left Side / Right Side), Description</p>
                <p><strong>Optional:</strong> Currency (defaults to AUD)</p>
                <p className="text-steel-500">Each row = one dambuster variant. Price = base price x quantity.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import History */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-steel-900 mb-4">Import History</h2>
        <div className="rounded-xl bg-white border border-steel-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-steel-50 text-left text-xs font-medium text-steel-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Results</th>
                <th className="px-4 py-3">Uploaded By</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-steel-100" />
                    </td>
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-steel-500">
                    No import history yet
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <React.Fragment key={job._id}>
                    <tr
                      className="hover:bg-steel-50/50 cursor-pointer transition-colors"
                      onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium text-steel-900 truncate max-w-[200px]">{job.fileName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{job.type}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {statusIcon(job.status)}
                          <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-steel-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand-500 transition-all"
                              style={{ width: `${job.totalRows ? (job.processedRows / job.totalRows) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-steel-500">{job.processedRows}/{job.totalRows}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-green-600 font-medium">{job.successCount} success</span>
                          {job.errorCount > 0 && (
                            <span className="text-red-500 font-medium">{job.errorCount} errors</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {job.uploadedBy ? `${job.uploadedBy.firstName} ${job.uploadedBy.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-steel-500 text-xs">
                        {new Date(job.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await api.get(`/admin/imports/${job._id}/download`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `${job.fileName.replace(/\.[^.]+$/, '')}_export.xlsx`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch {
                                toast.error('Failed to download');
                              }
                            }}
                            className="rounded-lg p-1.5 text-steel-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                            title="Download imported data"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteJob(job._id, e)}
                            className="rounded-lg p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Delete import record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedJob === job._id && job.errors.length > 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-3 bg-red-50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium text-red-700 mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              Import Errors ({job.errors.length})
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {job.errors.map((err, eIdx) => (
                                <div key={eIdx} className="text-xs text-red-600 flex gap-2">
                                  <span className="font-medium shrink-0">Row {err.row}:</span>
                                  <span>{err.message}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
