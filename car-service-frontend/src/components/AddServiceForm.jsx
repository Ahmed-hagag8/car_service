import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { API_BASE_URL } from '../services/api';
import { apiCall } from '../services/api';

const AddServiceForm = ({ carId, onClose, onSuccess }) => {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [formData, setFormData] = useState({
        car_id: carId,
        service_type_id: '',
        service_date: new Date().toISOString().split('T')[0],
        mileage_at_service: 0,
        cost: '',
        notes: '',
        service_provider: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchServiceTypes();
    }, []);

    const fetchServiceTypes = async () => {
        try {
            const data = await apiCall('/service-types');
            setServiceTypes(data);
        } catch (error) {
            console.error('Failed to fetch service types:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!formData.service_type_id || !formData.service_date || !formData.mileage_at_service) {
            setError('Please fill in required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const body = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== '' && value !== null) {
                    body.append(key, value);
                }
            });
            if (imageFile) {
                body.append('image', imageFile);
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/service-records`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to add service record');
            }

            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Service Record</h3>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Service Type *</label>
                        <select
                            value={formData.service_type_id}
                            onChange={(e) => setFormData({ ...formData, service_type_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select service type</option>
                            {serviceTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Service Date *</label>
                        <input
                            type="date"
                            value={formData.service_date}
                            onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Mileage (km) *</label>
                        <input
                            type="number"
                            value={formData.mileage_at_service}
                            onChange={(e) => setFormData({ ...formData, mileage_at_service: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Cost</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Service Provider</label>
                        <input
                            type="text"
                            value={formData.service_provider}
                            onChange={(e) => setFormData({ ...formData, service_provider: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Workshop name"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Additional notes..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Receipt Photo</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                                <Camera className="w-5 h-5 text-gray-500" />
                                <span className="text-sm text-gray-600">{imageFile ? imageFile.name : 'Upload photo'}</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">JPG/PNG, max 5MB</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add Service'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddServiceForm;
