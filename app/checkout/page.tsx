'use client';

import { useOrder } from '@/contexts/OrderContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AddressForm, AddressDetails } from '@/components/customization/AddressForm';
import { calculatePrice } from '@/lib/utils/pricing';
import { createOrder } from '@/lib/actions/order';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';

export default function CheckoutPage() {
    const { config, imageFile, cakeId } = useOrder();
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToast();

    const [isOrdering, setIsOrdering] = useState(false);
    const [formError, setFormError] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');

    // Date Logic
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 6);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const minDateStr = formatDate(today);
    const maxDateStr = formatDate(maxDate);

    // Time Validation
    const validateTime = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return true;

        const selectedDate = new Date(dateStr);
        const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (selectedDay.getTime() === currentDay.getTime()) {
            const now = new Date();
            const [hours, minutes] = timeStr.split(':').map(Number);
            const selectedTime = new Date();
            selectedTime.setHours(hours, minutes, 0, 0);

            const bufferTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            if (selectedTime < bufferTime) {
                return false;
            }
        }
        return true;
    };
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState<AddressDetails>({
        houseNo: '',
        street: '',
        landmark: '',
        city: '',
        zip: '',
        lat: undefined,
        lng: undefined
    });

    // Pre-fill name from session
    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session]);

    // Redirect if no config (user jumped here directly)
    useEffect(() => {
        if (!config) {
            router.replace('/');
        }
    }, [config, router]);

    if (!config) return null;

    const basePrice = calculatePrice(config);
    const printImageCharge = imageFile ? 5.00 : 0;
    const deliveryCharge = 40.00; // Fixed delivery charge
    const totalAmount = basePrice + printImageCharge + deliveryCharge;

    const handlePlaceOrder = async () => {
        // Validation
        if (!name.trim()) return showToast('Please enter your name', 'error');
        if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) return showToast('Please enter a valid 10-digit phone number', 'error');
        if (!address.houseNo || !address.street || !address.city || !address.zip) return showToast('Please complete the delivery address', 'error');
        if (!address.lat || !address.lng) return showToast('Please select a location on the map', 'error');

        setIsOrdering(true);
        try {
            const formData = new FormData();
            // Customization
            formData.append('shape', config.shape);
            formData.append('flavor', config.flavor);
            formData.append('color', config.color);
            formData.append('design', config.design);
            formData.append('weight', config.weight);
            formData.append('eggType', config.eggType);
            formData.append('message', config.message);
            if (config.notes) formData.append('notes', config.notes);

            formData.append('deliveryDate', deliveryDate);
            formData.append('deliveryTime', deliveryTime);

            // Contact
            formData.append('contact_name', name);
            formData.append('contact_phone', phone);

            // Address
            formData.append('address_houseNo', address.houseNo);
            formData.append('address_street', address.street);
            if (address.landmark) formData.append('address_landmark', address.landmark);
            formData.append('address_city', address.city);
            formData.append('address_zip', address.zip);
            formData.append('address_lat', address.lat.toString());
            formData.append('address_lng', address.lng.toString());

            // Financials
            formData.append('price', totalAmount.toString());
            if (cakeId) formData.append('cakeId', cakeId);

            // Image
            if (imageFile) formData.append('printImageUrl', imageFile);

            const result = await createOrder(formData);

            if (result?.error) {
                setFormError(result.error);
                setIsOrdering(false);
                return;
            }

            // Success handled by redirect in action, or:
            if (result?.success === false) {
                setFormError(result.error || 'Something went wrong');
                setIsOrdering(false);
                return;
            }

            if (result.success) {
                showToast('Order Placed Successfully! Redirecting...', 'success');
                setTimeout(() => {
                    router.push('/orders');
                }, 2000);
            } else {
                showToast(result.error || 'Failed to place order', 'error');
                setIsOrdering(false);
            }
        } catch (e) {
            console.error(e);
            showToast('An unexpected error occurred', 'error');
            setIsOrdering(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout & Delivery</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* LEFT COLUMN: FORMS */}
                    <div className="lg:col-span-7 space-y-10">
                        {/* 1. Contact Details */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                Contact Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:ring-gray-900 focus:border-gray-900"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:ring-gray-900 focus:border-gray-900"
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Delivery Schedule */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                Delivery Schedule
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        min={minDateStr}
                                        max={maxDateStr}
                                        value={deliveryDate}
                                        onChange={(e) => {
                                            setDeliveryDate(e.target.value);
                                            // Reset time if date changes to force re-validation
                                            if (!validateTime(e.target.value, deliveryTime)) {
                                                setDeliveryTime('');
                                            }
                                        }}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Book up to 7 days in advance</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={deliveryTime}
                                        onChange={(e) => {
                                            if (validateTime(deliveryDate, e.target.value)) {
                                                setDeliveryTime(e.target.value);
                                                setFormError('');
                                            } else {
                                                setFormError('Same-day orders require at least 2 hours preparation time.');
                                            }
                                        }}
                                        required
                                        disabled={!deliveryDate}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${!deliveryDate ? 'bg-gray-100 cursor-not-allowed' : 'bg-white border-gray-200'
                                            }`}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Select delivery time</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Delivery Address */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                                Delivery Location
                            </h2>
                            <AddressForm value={address} onChange={setAddress} />
                        </section>
                    </div>

                    {/* RIGHT COLUMN: SUMMARY */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            {/* Cake Snapshot */}
                            <div className="flex items-start gap-4 mb-8 pb-8 border-b border-gray-100">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                                    <span className="text-3xl">🎂</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 capitalize">{config.shape.replace('_', ' ')} Cake</h3>
                                    <p className="text-sm text-gray-500 capitalize">{config.flavor} • {config.design} • {config.weight}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config.eggType === 'egg' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {config.eggType}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: config.color.replace('pastel_', 'var(--color-)') }}></div>
                                        <span className="text-xs text-gray-400 capitalize">{config.color.replace('pastel_', '')}</span>
                                    </div>
                                    {config.message && (
                                        <p className="text-xs text-gray-500 italic mt-2">"{config.message}"</p>
                                    )}
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                {formError && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                                        <span className="text-xl">⚠️</span>
                                        {formError}
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                                    <span>Base Cake Price</span>
                                    <span>₹{basePrice.toFixed(2)}</span>
                                </div>
                                {imageFile && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Print Image Add-on</span>
                                        <span>₹{printImageCharge.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Charge</span>
                                    <span>₹{deliveryCharge.toFixed(2)}</span>
                                </div>

                                <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-4">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isOrdering}
                                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                {isOrdering ? 'Creating Order...' : 'Confirm & Pay (COD)'}
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-4">
                                By placing this order, you agree to our Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
