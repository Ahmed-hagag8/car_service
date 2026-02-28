import React, { useState } from 'react';
import { apiCall } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const AddCarForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        brand: '', model: '', year: new Date().getFullYear(),
        current_mileage: 0, plate_number: '', color: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const handleSubmit = async () => {
        if (!formData.brand || !formData.model) {
            setError(t('fill_required'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            await apiCall('/cars', { method: 'POST', body: JSON.stringify(formData) });
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('add_car')}</h3>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
            )}

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('brand')} *</label>
                        <input type="text" value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Toyota" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('model')} *</label>
                        <input type="text" value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Camry" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('year')} *</label>
                        <input type="number" value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1900" max={new Date().getFullYear() + 1} />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('mileage')} *</label>
                        <input type="number" value={formData.current_mileage}
                            onChange={(e) => setFormData({ ...formData, current_mileage: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('plate_number')}</label>
                        <input type="text" value={formData.plate_number}
                            onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ABC123" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('color')}</label>
                        <input type="text" value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleSubmit} disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                        {loading ? t('adding') : t('add_car')}
                    </button>
                    <button onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                        {t('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCarForm;
