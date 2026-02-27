import React, { useState, useEffect, useCallback } from 'react';
import { Car, Plus } from 'lucide-react';
import { apiCall } from '../services/api';
import CarCard from '../components/CarCard';
import AddCarForm from '../components/AddCarForm';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const CarsPage = ({ onRefresh, onToast }) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchCars = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page);
            if (search) params.set('search', search);

            const data = await apiCall(`/cars?${params.toString()}`);
            setCars(data.data);
            setPagination({
                currentPage: data.current_page,
                lastPage: data.last_page,
                total: data.total,
                perPage: data.per_page
            });
        } catch (error) {
            console.error('Failed to fetch cars:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchCars();
    }, [fetchCars]);

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleRefresh = () => {
        fetchCars();
        onRefresh();
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Cars</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Car
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 max-w-md">
                <SearchBar
                    placeholder="Search by make, model, or plate..."
                    onSearch={handleSearch}
                />
            </div>

            {showAddForm && (
                <AddCarForm
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        onToast('Car added successfully');
                        handleRefresh();
                    }}
                />
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Car className="w-12 h-12 text-blue-600 animate-pulse" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cars.map(car => (
                            <CarCard key={car.id} car={car} onRefresh={handleRefresh} onToast={onToast} />
                        ))}
                    </div>

                    {cars.length === 0 && !showAddForm && (
                        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {search ? 'No Cars Found' : 'No Cars Yet'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {search ? 'Try a different search term' : 'Add your first car to start tracking services'}
                            </p>
                            {!search && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Add Your First Car
                                </button>
                            )}
                        </div>
                    )}

                    {pagination && (
                        <Pagination
                            currentPage={pagination.currentPage}
                            lastPage={pagination.lastPage}
                            total={pagination.total}
                            perPage={pagination.perPage}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default CarsPage;
