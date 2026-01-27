'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { IOption, OptionType } from '@/lib/db/models/Option';
import { createOption, updateOption, deleteOption } from '@/lib/actions/options';
import { uploadOptionImageAction } from '@/lib/actions/upload';
import { Toast } from '@/components/ui/Toast';

interface OptionsManagerProps {
    initialOptions: IOption[];
}

export default function OptionsManager({ initialOptions }: OptionsManagerProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<OptionType>('shape');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<IOption | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    // Form states
    const formRef = useRef<HTMLFormElement>(null);

    const filteredOptions = initialOptions.filter(o => o.type === activeTab);

    const handleOpenModal = (option?: IOption) => {
        setEditingOption(option || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingOption(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        let imageUrl = formData.get('image') as string || undefined;

        // Handle File Upload
        const file = formData.get('file') as File;
        if (file && file.size > 0) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            const uploadResult = await uploadOptionImageAction(uploadFormData);

            if (!uploadResult.success) {
                setToast({ show: true, message: uploadResult.error || 'Upload failed', type: 'error' });
                setIsLoading(false);
                return;
            }
            imageUrl = uploadResult.url;
        }

        const data: Partial<IOption> = {
            type: activeTab,
            name: formData.get('name') as string,
            price: Number(formData.get('price')),
            isActive: formData.get('isActive') === 'on',
            image: imageUrl,
        };

        // Handle metadata (simplified for now, ideally dynamic fields based on type)
        const hex = formData.get('hex') as string;
        const desc = formData.get('desc') as string;
        if (hex || desc) {
            data.metadata = {};
            if (hex) data.metadata.hex = hex;
            if (desc) data.metadata.desc = desc;
        }

        let result;
        if (editingOption) {
            result = await updateOption(editingOption._id as unknown as string, data);
        } else {
            result = await createOption(data);
        }

        setIsLoading(false);

        if (result.success) {
            setToast({ show: true, message: `Option ${editingOption ? 'updated' : 'created'} successfully!`, type: 'success' });
            handleCloseModal();
            router.refresh();
        } else {
            setToast({ show: true, message: result.error || 'Something went wrong', type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this option?')) return;

        setIsLoading(true);
        const result = await deleteOption(id);
        setIsLoading(false);

        if (result.success) {
            setToast({ show: true, message: 'Option deleted successfully', type: 'success' });
            router.refresh();
        } else {
            setToast({ show: true, message: result.error || 'Failed to delete', type: 'error' });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, show: false }))} />

            {/* Tabs */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
                {(['shape', 'flavor', 'color', 'design'] as OptionType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap transition-colors ${activeTab === type
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        {type}s
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{activeTab} Options</h3>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOptions.map(option => (
                        <div key={option._id as unknown as string} className="group relative border border-gray-100 rounded-xl p-4 hover:border-blue-100 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    {/* Type specific preview */}
                                    {activeTab === 'color' && (
                                        <div className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: option.metadata?.hex || '#ccc' }} />
                                    )}
                                    {activeTab !== 'color' && option.image && (
                                        <NextImage src={option.image} alt={option.name} width={40} height={40} className="w-10 h-10 object-contain" />
                                    )}
                                    <div>
                                        <h4 className="font-bold text-gray-900">{option.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">₹{option.price}</span>
                                            {option.isActive ? (
                                                <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                                            ) : (
                                                <span className="text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded">Inactive</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(option)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(option._id as unknown as string)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {option.metadata?.desc && (
                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{option.metadata.desc}</p>
                            )}
                        </div>
                    ))}
                    {filteredOptions.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            No options found for {activeTab}.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-6">{editingOption ? 'Edit' : 'New'} {activeTab} Option</h3>
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                    <input
                                        name="name"
                                        defaultValue={editingOption?.name}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Price (₹)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        defaultValue={editingOption?.price || 0}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    />
                                </div>
                            </div>

                            {activeTab === 'color' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Hex Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            name="hex"
                                            defaultValue={editingOption?.metadata?.hex || '#000000'}
                                            className="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer"
                                        />
                                        <input
                                            name="hex_text" // Just for display, actual logic might need to sync
                                            defaultValue={editingOption?.metadata?.hex}
                                            placeholder="#000000"
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                                        />
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'flavor') && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                    <input
                                        name="desc"
                                        defaultValue={editingOption?.metadata?.desc}
                                        placeholder="Brief description..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                                    />
                                </div>
                            )}

                            {(activeTab === 'shape' || activeTab === 'design') && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Image</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Upload New Image</label>
                                            <input
                                                type="file"
                                                name="file"
                                                accept="image/*"
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition-colors"
                                            />
                                        </div>
                                        <div className="relative flex items-center py-1">
                                            <div className="flex-grow border-t border-gray-200"></div>
                                            <span className="flex-shrink-0 mx-2 text-xs text-gray-400">OR USE URL</span>
                                            <div className="flex-grow border-t border-gray-200"></div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Image Path / URL</label>
                                            <input
                                                name="image"
                                                defaultValue={editingOption?.image}
                                                placeholder="/cake/shapes/..."
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActive"
                                    defaultChecked={editingOption ? editingOption.isActive : true}
                                    className="w-4 h-4 rounded text-black focus:ring-black"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Available for customers</label>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 text-sm font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Saving...' : 'Save Option'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
