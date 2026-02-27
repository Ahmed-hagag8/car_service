import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmDialog = ({ title, message, confirmText = 'Delete', confirmColor = 'bg-red-600 hover:bg-red-700', onConfirm, onCancel, loading = false }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]" onClick={onCancel}>
            <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 ${confirmColor} text-white py-2 rounded-lg font-semibold transition disabled:opacity-50`}
                        >
                            {loading ? 'Please wait...' : confirmText}
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
