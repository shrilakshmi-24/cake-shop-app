'use client';

import { useOrder } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { AddressForm, AddressDetails } from '@/components/customization/AddressForm';
import { calculatePrice, PRINT_IMAGE_COST } from '@/lib/utils/pricing';
import { createOrder } from '@/lib/actions/order';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';

export default function CheckoutPage() {
    const { config: orderConfig, imageFile: orderImage, cakeId: orderCakeId, orderType: orderTypeCtx, referenceImageFile, basePrice: contextBasePrice } = useOrder();
    const { items: cartItems, clearCart } = useCart();

    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { showToast } = useToast();

    const isCartSource = searchParams.get('source') === 'cart';

    // derivedItems: Normalize single item (Buy Now) and cart items into unified structure
    const checkoutItems = useMemo(() => {
        if (isCartSource) {
            return cartItems.map(item => ({
                config: item.config,
                imageFile: item.imageFile,
                cakeId: item.cakeId,
                basePrice: item.basePrice,
                price: item.price,
                quantity: item.quantity,
                orderType: item.orderType || 'CUSTOMIZED_CAKE' // Use stored type, fallback if missing
            }));
        } else if (orderConfig) {
            const basePrice = calculatePrice(orderConfig, contextBasePrice);
            const printImageCharge = orderImage ? PRINT_IMAGE_COST : 0;
            return [{
                config: orderConfig,
                imageFile: orderImage,
                cakeId: orderCakeId,
                basePrice: contextBasePrice,
                price: basePrice + printImageCharge,
                quantity: 1,
                orderType: orderTypeCtx || 'CUSTOMIZED_CAKE',
                referenceImageFile: referenceImageFile
            }];
        }
        return [];
    }, [isCartSource, cartItems, orderConfig, orderImage, orderCakeId, contextBasePrice, orderTypeCtx, referenceImageFile]);

    const [isOrdering, setIsOrdering] = useState(false);
    const [formError, setFormError] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');

    // ... Date Logic ...
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 6);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const minDateStr = formatDate(today);
    const maxDateStr = formatDate(maxDate);

    // ... Time Validation ...
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

            const bufferTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours buffer

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

    // ... Effects ...
    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session]);

    useEffect(() => {
        if (checkoutItems.length === 0) {
            router.replace('/');
        }
    }, [checkoutItems, router]);

    if (checkoutItems.length === 0) return null;

    const deliveryCharge = 40.00;
    // Total Amount: Sum of (Item Price * Quantity) + Single Delivery Charge for the whole order? 
    // Usually delivery is per order.
    const itemsTotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = itemsTotal + deliveryCharge;

    const handlePlaceOrder = async () => {
        // Validation
        if (!name.trim()) return showToast('Please enter your name', 'error');
        if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) return showToast('Please enter a valid 10-digit phone number', 'error');
        if (!address.houseNo || !address.street || !address.city || !address.zip) return showToast('Please complete the delivery address', 'error');
        if (!address.lat || !address.lng) return showToast('Please select a location on the map', 'error');

        setIsOrdering(true);
        try {
            // Need to handle multiple orders sequentially or parallel
            // We'll treat the delivery charge as applied to the FIRST order, or spread?
            // Actually, if we create separate orders, each will have its own finalPrice in DB.
            // If we split orders, backend calculates price again?
            // createOrder backend calculates price.
            // Our backend createOrder adds +40 delivery internally.
            // If we send 3 orders, the user gets charged 3 delivery fees?
            // Ideally current backend: `let finalPrice = ... + 40;`
            // Yes, each order has +40.
            // For MVP Cart, paying delivery per cake is acceptable or we should modify backend.
            // OPTION: We'll accept per-cake delivery for MVP to allow 'Split Orders'.
            // Or we could try to hack it by sending a flag to skip delivery? No unsafe.

            const results = [];

            for (const item of checkoutItems) {
                // If quantity > 1, create N orders for this item?
                // Or create 1 order with quantity noted in notes?
                // Schema doesn't support quantity. We must loop quantity too.
                for (let i = 0; i < item.quantity; i++) {
                    const formData = new FormData();
                    // Customization
                    formData.append('shape', item.config.shape);
                    formData.append('flavor', item.config.flavor);
                    formData.append('color', item.config.color);
                    formData.append('design', item.config.design);
                    formData.append('weight', item.config.weight);
                    formData.append('eggType', item.config.eggType);
                    formData.append('message', item.config.message);
                    if (item.config.notes) formData.append('notes', item.config.notes);

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

                    // Financials (Note: Backend largely recalculates base, but uses this for legacy checks possibly)
                    // We send the item price. Backend `finalPrice` logic overrides this usually, but let's send.
                    formData.append('price', item.price.toString());
                    if (item.cakeId) formData.append('cakeId', item.cakeId);

                    // Image
                    if (item.imageFile) formData.append('printImageUrl', item.imageFile);

                    // New Fields
                    if (item.orderType) formData.append('orderType', item.orderType);
                    // Handle reference image only if it exists on this item (Unified structure has it for OrderContext item)
                    if ((item as any).referenceImageFile) formData.append('referenceImageUrl', (item as any).referenceImageFile);

                    try {
                        const res = await createOrder(formData);
                        results.push(res);
                    } catch (e) {
                        results.push({ success: false, error: 'Network error' });
                    }
                }
            }

            // Check results
            const failures = results.filter(r => !r.success);
            if (failures.length > 0) {
                setFormError(`Failed to place ${failures.length} orders. ${failures[0].error}`);
                setIsOrdering(false);
                return;
            }

            // Success
            if (isCartSource) {
                clearCart();
            }

            showToast(`Successfully placed ${results.length} orders! Redirecting...`, 'success');
            setTimeout(() => {
                router.push('/orders');
            }, 2000);

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
                                        placeholder="--"
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

                            {/* Cake Snapshot(s) */}
                            <div className="space-y-6 mb-8 pb-8 border-b border-gray-100">
                                {checkoutItems.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 relative">
                                            <span className="text-3xl">🎂</span>
                                            {item.quantity > 1 && (
                                                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                                    x{item.quantity}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 capitalize">{(item as any).name || item.config.shape.replace('_', ' ') + ' Cake'}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{item.config.flavor} • {item.config.design} • {item.config.weight}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.config.eggType === 'egg' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                    {item.config.eggType}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: item.config.color.replace('pastel_', 'var(--color-)') }}></div>
                                                <span className="text-xs text-gray-400 capitalize">{item.config.color.replace('pastel_', '')}</span>
                                            </div>
                                            {item.config.message && (
                                                <p className="text-xs text-gray-500 italic mt-2">"{item.config.message}"</p>
                                            )}
                                            {item.imageFile && (
                                                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                                    <span>📷</span> Print Image (+₹{PRINT_IMAGE_COST})
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
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
                                    <span>Subtotal ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                                    <span>₹{itemsTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Charge (All items)</span>
                                    {/* Note: We display one delivery charge here, but if backend charges per item, we might need to explain or adjust.
                                        Ideally for MVP, users might be confused if they see 40 but get charged 120 in history.
                                        But since finalPrice is calculated in backend per order, and we split orders...
                                        Actually, let's keep it simple: Show "Total Estimated" as sum of all expected per-order costs.
                                        Per order cost = Item Price + 40.
                                        Total = Sum(ItemPrice + 40).
                                        So Delivery = 40 * quantity.
                                    */}
                                    <span>₹{(deliveryCharge * checkoutItems.reduce((acc, i) => acc + i.quantity, 0)).toFixed(2)}</span>
                                </div>

                                <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-4">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{(itemsTotal + (deliveryCharge * checkoutItems.reduce((acc, i) => acc + i.quantity, 0))).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isOrdering}
                                className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98] shadow-rose-200"
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
