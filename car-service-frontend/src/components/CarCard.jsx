import React, { useState, useEffect } from 'react';
import { Car, X, Plus, Edit3, Trash2 } from 'lucide-react';
import { apiCall } from '../services/api';
import { parseLocalDate } from '../utils/dateUtils';
import AddServiceForm from './AddServiceForm';
import EditCarForm from './EditCarForm';
import ConfirmDialog from './ConfirmDialog';

// Car Details Modal
const CarDetailsModal = ({ car, stats, onClose, onRefresh, onToast }) => {
    const [showAddService, setShowAddService] = useState(false);
    const [showEditCar, setShowEditCar] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteServiceId, setDeleteServiceId] = useState(null);
    const [deletingCar, setDeletingCar] = useState(false);
    const [deletingService, setDeletingService] = useState(false);

    const handleDeleteCar = async () => {
        setDeletingCar(true);
        try {
            await apiCall(`/cars/${car.id}`, { method: 'DELETE' });
            onToast('Car deleted successfully');
            onRefresh();
            onClose();
        } catch (error) {
            onToast(error.message, 'error');
        } finally {
            setDeletingCar(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleDeleteService = async () => {
        if (!deleteServiceId) return;
        setDeletingService(true);
        try {
            await apiCall(`/service-records/${deleteServiceId}`, { method: 'DELETE' });
            onToast('Service record deleted successfully');
            onRefresh();
            onClose();
        } catch (error) {
            onToast(error.message, 'error');
        } finally {
            setDeletingService(false);
            setDeleteServiceId(null);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">{car.brand} {car.model}</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowEditCar(true)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Car"
                            >
                                <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Car"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Car Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Year</p>
                                <p className="font-semibold text-gray-800">{car.year}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Mileage</p>
                                <p className="font-semibold text-gray-800">{car.current_mileage?.toLocaleString()} km</p>
                            </div>
                            {car.plate_number && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Plate</p>
                                    <p className="font-semibold text-gray-800">{car.plate_number}</p>
                                </div>
                            )}
                            {car.color && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Color</p>
                                    <p className="font-semibold text-gray-800">{car.color}</p>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-blue-600 font-medium">Total Spent</p>
                                    <p className="text-2xl font-bold text-blue-900 mt-1">
                                        ${Number(stats.statistics.total_cost || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-green-600 font-medium">Services Done</p>
                                    <p className="text-2xl font-bold text-green-900 mt-1">
                                        {stats.statistics.service_count}
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <p className="text-sm text-purple-600 font-medium">Avg Cost</p>
                                    <p className="text-2xl font-bold text-purple-900 mt-1">
                                        ${Number(stats.statistics.average_cost || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Add Service Button */}
                        <button
                            onClick={() => setShowAddService(true)}
                            className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Add Service Record
                        </button>

                        {showAddService && (
                            <AddServiceForm
                                carId={car.id}
                                onClose={() => setShowAddService(false)}
                                onSuccess={() => {
                                    setShowAddService(false);
                                    onToast('Service record added successfully');
                                    onRefresh();
                                    onClose();
                                }}
                            />
                        )}

                        {/* Recent Services */}
                        {stats?.recent_services && stats.recent_services.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Services</h3>
                                <div className="space-y-3">
                                    {stats.recent_services.map(service => (
                                        <div key={service.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-800">{service.service_type?.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    {service.cost && (
                                                        <span className="text-sm font-medium text-gray-600">
                                                            ${Number(service.cost).toFixed(2)}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteServiceId(service.id)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                                                        title="Delete service record"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p>Date: {parseLocalDate(service.service_date).toLocaleDateString()}</p>
                                                <p>Mileage: {service.mileage_at_service?.toLocaleString()} km</p>
                                                {service.service_provider && <p>Provider: {service.service_provider}</p>}
                                                {service.notes && <p className="italic">Notes: {service.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Car Modal */}
            {showEditCar && (
                <EditCarForm
                    car={car}
                    onClose={() => setShowEditCar(false)}
                    onSuccess={(msg) => {
                        setShowEditCar(false);
                        onToast(msg);
                        onRefresh();
                        onClose();
                    }}
                />
            )}

            {/* Delete Car Confirmation */}
            {showDeleteConfirm && (
                <ConfirmDialog
                    title="Delete Car?"
                    message={`Are you sure you want to delete ${car.brand} ${car.model}? This will also delete all service records and reminders for this car.`}
                    confirmText="Delete Car"
                    onConfirm={handleDeleteCar}
                    onCancel={() => setShowDeleteConfirm(false)}
                    loading={deletingCar}
                />
            )}

            {/* Delete Service Confirmation */}
            {deleteServiceId && (
                <ConfirmDialog
                    title="Delete Service Record?"
                    message="Are you sure you want to delete this service record? This action cannot be undone."
                    confirmText="Delete"
                    onConfirm={handleDeleteService}
                    onCancel={() => setDeleteServiceId(null)}
                    loading={deletingService}
                />
            )}
        </>
    );
};

// Car Card
const CarCard = ({ car, onRefresh, onToast }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (showDetails && !stats) {
            fetchStats();
        }
    }, [showDetails]);

    const fetchStats = async () => {
        try {
            const data = await apiCall(`/cars/${car.id}/stats`);
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition cursor-pointer" onClick={() => setShowDetails(true)}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{car.brand} {car.model}</h3>
                        <p className="text-gray-600">{car.year}</p>
                    </div>
                    <Car className="w-8 h-8 text-blue-600" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mileage:</span>
                        <span className="font-semibold text-gray-800">{car.current_mileage?.toLocaleString()} km</span>
                    </div>
                    {car.plate_number && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Plate:</span>
                            <span className="font-semibold text-gray-800">{car.plate_number}</span>
                        </div>
                    )}
                </div>
            </div>

            {showDetails && (
                <CarDetailsModal
                    car={car}
                    stats={stats}
                    onClose={() => setShowDetails(false)}
                    onRefresh={onRefresh}
                    onToast={onToast}
                />
            )}
        </>
    );
};

export default CarCard;
