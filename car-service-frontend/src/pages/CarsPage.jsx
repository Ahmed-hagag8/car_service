import React, { useState } from 'react';
import { Car, Plus } from 'lucide-react';
import CarCard from '../components/CarCard';
import AddCarForm from '../components/AddCarForm';

const CarsPage = ({ cars, onRefresh }) => {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Cars</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Car
                </button>
            </div>

            {showAddForm && (
                <AddCarForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); onRefresh(); }} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map(car => (
                    <CarCard key={car.id} car={car} onRefresh={onRefresh} />
                ))}
            </div>

            {cars.length === 0 && !showAddForm && (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                    <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Cars Yet</h3>
                    <p className="text-gray-600 mb-6">Add your first car to start tracking services</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Add Your First Car
                    </button>
                </div>
            )}
        </div>
    );
};

export default CarsPage;
