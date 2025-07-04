import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, LayoutDashboard, PlusCircle, MoreVertical, Edit, Trash2, X } from 'lucide-react';

// --- Firebase Configuration ---
// These global variables are provided by the environment.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-saas-app';

// --- Main App Component ---
const App = () => {
    // --- State Management ---
    const [page, setPage] = useState('dashboard'); // 'dashboard', 'patients', 'appointments', 'payments'
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [payments, setPayments] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null); // 'addPatient', 'addAppointment', 'addPayment'
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Firebase Initialization and Authentication ---
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestoreDb);
            setAuth(firebaseAuth);

            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    try {
                        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                            await signInWithCustomToken(firebaseAuth, __initial_auth_token);
                        } else {
                            await signInAnonymously(firebaseAuth);
                        }
                    } catch (authError) {
                        console.error("Authentication Error:", authError);
                        setError("Failed to authenticate. Please refresh the page.");
                    }
                }
                setIsAuthReady(true);
            });
            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase Initialization Error:", e);
            setError("Could not connect to services. Check configuration.");
            setIsLoading(false);
        }
    }, []);

    // --- Data Fetching from Firestore ---
    useEffect(() => {
        if (isAuthReady && db && userId) {
            setIsLoading(true);
            const collections = ['patients', 'appointments', 'payments'];
            const unsubscribers = collections.map(colName => {
                const q = query(collection(db, `artifacts/${appId}/users/${userId}/${colName}`));
                return onSnapshot(q, (querySnapshot) => {
                    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    if (colName === 'patients') setPatients(data);
                    if (colName === 'appointments') setAppointments(data.map(a => ({...a, dateTime: a.dateTime?.toDate() })));
                    if (colName === 'payments') setPayments(data.map(p => ({...p, date: p.date?.toDate() })));
                }, (err) => {
                    console.error(`Error fetching ${colName}:`, err);
                    setError(`Failed to load ${colName}.`);
                });
            });

            // Set a timeout to handle cases where data might be empty but not loading
            const loadingTimeout = setTimeout(() => setIsLoading(false), 2000);

            // Cleanup function to unsubscribe from listeners
            return () => {
                unsubscribers.forEach(unsub => unsub());
                clearTimeout(loadingTimeout);
            };
        } else if (isAuthReady) {
            // Handle case where db or userId is not set after auth is ready
            setIsLoading(false);
        }
    }, [isAuthReady, db, userId]);
    
    // --- Event Handlers for Modals ---
    const openModal = (type) => {
        setModalContent(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    // --- Data Submission Handlers ---
    const handleAddPatient = async (patientData) => {
        if (!db || !userId) return;
        try {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/patients`), {
                ...patientData,
                createdAt: serverTimestamp()
            });
            closeModal();
        } catch (e) {
            console.error("Error adding patient: ", e);
            alert("Failed to add patient.");
        }
    };

    const handleAddAppointment = async (appointmentData) => {
        if (!db || !userId) return;
        const selectedPatient = patients.find(p => p.id === appointmentData.patientId);
        try {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/appointments`), {
                ...appointmentData,
                patientName: selectedPatient ? selectedPatient.name : 'Unknown Patient',
                dateTime: new Date(appointmentData.dateTime),
                status: 'Scheduled',
                createdAt: serverTimestamp()
            });
            closeModal();
        } catch (e) {
            console.error("Error adding appointment: ", e);
            alert("Failed to add appointment.");
        }
    };

    const handleAddPayment = async (paymentData) => {
        if (!db || !userId) return;
        const selectedPatient = patients.find(p => p.id === paymentData.patientId);
        try {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/payments`), {
                ...paymentData,
                patientName: selectedPatient ? selectedPatient.name : 'Unknown Patient',
                amount: parseFloat(paymentData.amount),
                date: new Date(paymentData.date),
                status: 'Paid',
                createdAt: serverTimestamp()
            });
            closeModal();
        } catch (e) {
            console.error("Error adding payment: ", e);
            alert("Failed to add payment.");
        }
    };
    
    const updateAppointmentStatus = async (id, status) => {
        if (!db || !userId) return;
        try {
            const appointmentRef = doc(db, `artifacts/${appId}/users/${userId}/appointments`, id);
            await setDoc(appointmentRef, { status }, { merge: true });
        } catch (e) {
            console.error("Error updating status: ", e);
            alert("Failed to update status.");
        }
    };

    // --- Render Logic ---
    const renderPage = () => {
        if (isLoading && !error) {
            return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
        }
        if (error) {
            return <div className="text-center text-red-500 font-semibold">{error}</div>;
        }

        switch (page) {
            case 'patients':
                return <PatientsPage patients={patients} />;
            case 'appointments':
                return <AppointmentsPage appointments={appointments} updateStatus={updateAppointmentStatus} />;
            case 'payments':
                return <PaymentsPage payments={payments} />;
            case 'dashboard':
            default:
                return <DashboardPage patients={patients} appointments={appointments} payments={payments} />;
        }
    };

    const renderModal = () => {
        if (!isModalOpen) return null;
        switch (modalContent) {
            case 'addPatient':
                return <AddPatientModal onClose={closeModal} onSubmit={handleAddPatient} />;
            case 'addAppointment':
                return <AddAppointmentModal onClose={closeModal} onSubmit={handleAddAppointment} patients={patients} />;
            case 'addPayment':
                return <AddPaymentModal onClose={closeModal} onSubmit={handleAddPayment} patients={patients} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
            <div className="flex flex-col md:flex-row">
                <Sidebar page={page} setPage={setPage} userId={userId} />
                <main className="flex-1 p-4 md:p-8 md:ml-64">
                    <Header page={page} onAddClick={() => openModal(`add${page.charAt(0).toUpperCase() + page.slice(1, -1)}`)} />
                    <div className="mt-8">
                        {renderPage()}
                    </div>
                </main>
            </div>
            {renderModal()}
            <BottomNav page={page} setPage={setPage} />
        </div>
    );
};

// --- Sub-Components (Pages) ---

const DashboardPage = ({ patients, appointments, payments }) => {
    const upcomingAppointments = useMemo(() => 
        appointments
            .filter(a => a.dateTime && a.dateTime > new Date())
            .sort((a, b) => a.dateTime - b.dateTime)
            .slice(0, 5), 
        [appointments]
    );

    const monthlyRevenue = useMemo(() => {
        const data = {};
        payments.forEach(p => {
            if (p.date) {
                const month = p.date.toLocaleString('default', { month: 'short', year: '2-digit' });
                if (!data[month]) data[month] = 0;
                data[month] += p.amount;
            }
        });
        // Format for recharts, ensuring chronological order
        const sortedMonths = Object.keys(data).sort((a, b) => {
            const [m1, y1] = a.split(' ');
            const [m2, y2] = b.split(' ');
            return new Date(`1 ${m1} ${y1}`) - new Date(`1 ${m2} ${y2}`);
        });
        return sortedMonths.map(month => ({ name: month, revenue: data[month] }));
    }, [payments]);

    const stats = [
        { title: "Total Patients", value: patients.length, icon: <Users className="w-8 h-8 text-blue-500" /> },
        { title: "Upcoming Appointments", value: appointments.filter(a => a.dateTime && a.dateTime > new Date() && a.status === 'Scheduled').length, icon: <Calendar className="w-8 h-8 text-green-500" /> },
        { title: "Revenue This Month", value: `$${payments.filter(p => p.date && p.date.getMonth() === new Date().getMonth()).reduce((acc, p) => acc + p.amount, 0).toFixed(2)}`, icon: <DollarSign className="w-8 h-8 text-yellow-500" /> },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Stat Cards */}
            {stats.map(stat => (
                <div key={stat.title} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    {stat.icon}
                </div>
            ))}

            {/* Monthly Revenue Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-4">Monthly Revenue</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={monthlyRevenue} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Upcoming Appointments List */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-4">Upcoming Appointments</h3>
                <ul className="space-y-4">
                    {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                        <li key={app.id} className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{app.patientName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{app.dateTime.toLocaleString()}</p>
                            </div>
                            <span className="text-sm font-medium text-green-500">{app.status}</span>
                        </li>
                    )) : <p className="text-gray-500 dark:text-gray-400">No upcoming appointments.</p>}
                </ul>
            </div>
        </div>
    );
};

const PatientsPage = ({ patients }) => (
    <Card>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b dark:border-gray-700">
                        <th className="p-4">Name</th>
                        <th className="p-4 hidden md:table-cell">Email</th>
                        <th className="p-4 hidden sm:table-cell">Phone</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.length > 0 ? patients.map(p => (
                        <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4 font-medium">{p.name}</td>
                            <td className="p-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">{p.email}</td>
                            <td className="p-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{p.phone}</td>
                            <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><MoreVertical size={18} /></button></td>
                        </tr>
                    )) : <tr><td colSpan="4" className="text-center p-8 text-gray-500">No patients found.</td></tr>}
                </tbody>
            </table>
        </div>
    </Card>
);

const AppointmentsPage = ({ appointments, updateStatus }) => {
    const sortedAppointments = useMemo(() => 
        [...appointments].sort((a,b) => (b.dateTime || 0) - (a.dateTime || 0)),
        [appointments]
    );

    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Patient</th>
                            <th className="p-4 hidden md:table-cell">Date & Time</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAppointments.length > 0 ? sortedAppointments.map(a => (
                            <tr key={a.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-4 font-medium">{a.patientName}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">{a.dateTime ? a.dateTime.toLocaleString() : 'No Date'}</td>
                                <td className="p-4">
                                    <select 
                                        value={a.status} 
                                        onChange={(e) => updateStatus(a.id, e.target.value)}
                                        className={`rounded-md px-2 py-1 text-sm font-semibold bg-transparent border ${
                                            a.status === 'Completed' ? 'text-green-600 border-green-600' :
                                            a.status === 'Cancelled' ? 'text-red-600 border-red-600' :
                                            'text-blue-600 border-blue-600'
                                        }`}
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><MoreVertical size={18} /></button></td>
                            </tr>
                        )) : <tr><td colSpan="4" className="text-center p-8 text-gray-500">No appointments found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const PaymentsPage = ({ payments }) => {
     const sortedPayments = useMemo(() => 
        [...payments].sort((a,b) => (b.date || 0) - (a.date || 0)),
        [payments]
    );
    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4">Patient</th>
                            <th className="p-4 hidden md:table-cell">Date</th>
                            <th className="p-4 hidden sm:table-cell">Method</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPayments.length > 0 ? sortedPayments.map(p => (
                            <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-4 font-medium">{p.patientName}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">{p.date ? p.date.toLocaleDateString() : 'No Date'}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{p.method}</td>
                                <td className="p-4 font-semibold text-green-600">${p.amount.toFixed(2)}</td>
                                <td className="p-4"><button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><MoreVertical size={18} /></button></td>
                            </tr>
                        )) : <tr><td colSpan="5" className="text-center p-8 text-gray-500">No payments found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


// --- UI Components ---

const Sidebar = ({ page, setPage, userId }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'payments', label: 'Payments', icon: DollarSign },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 fixed h-full">
            <div className="px-8 py-6">
                <h1 className="text-2xl font-bold text-blue-600">TherapySaaS</h1>
            </div>
            <nav className="flex-1 px-4">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setPage(item.id)}
                        className={`w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors ${
                            page === item.id 
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">User ID: {userId || 'Loading...'}</p>
            </div>
        </aside>
    );
};

const BottomNav = ({ page, setPage }) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard },
        { id: 'patients', icon: Users },
        { id: 'appointments', icon: Calendar },
        { id: 'payments', icon: DollarSign },
    ];
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around p-2 z-50">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                        page === item.id ? 'text-blue-600' : 'text-gray-500'
                    }`}
                >
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs mt-1">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

const Header = ({ page, onAddClick }) => {
    const title = page.charAt(0).toUpperCase() + page.slice(1);
    const canAdd = ['patients', 'appointments', 'payments'].includes(page);

    return (
        <div className="flex justify-between items-center pb-4 mb-4 md:mb-0 border-b dark:border-gray-700">
            <h2 className="text-3xl font-bold">{title}</h2>
            {canAdd && (
                <button onClick={onAddClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow">
                    <PlusCircle size={20} />
                    <span className="hidden sm:inline">Add New</span>
                </button>
            )}
        </div>
    );
};

const Card = ({ children }) => (
    <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-xl shadow-md">
        {children}
    </div>
);

// --- Modal Components ---

const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold">{title}</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);

const AddPatientModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal onClose={onClose} title="Add New Patient">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                <Button type="submit" className="w-full">Save Patient</Button>
            </form>
        </Modal>
    );
};

const AddAppointmentModal = ({ onClose, onSubmit, patients }) => {
    const [formData, setFormData] = useState({ patientId: '', dateTime: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal onClose={onClose} title="Schedule Appointment">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select label="Patient" name="patientId" value={formData.patientId} onChange={handleChange} required>
                    <option value="" disabled>Select a patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
                <Input label="Date and Time" name="dateTime" type="datetime-local" value={formData.dateTime} onChange={handleChange} required />
                <Button type="submit" className="w-full">Schedule Appointment</Button>
            </form>
        </Modal>
    );
};

const AddPaymentModal = ({ onClose, onSubmit, patients }) => {
    const [formData, setFormData] = useState({ patientId: '', amount: '', date: '', method: 'Card' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal onClose={onClose} title="Record Payment">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select label="Patient" name="patientId" value={formData.patientId} onChange={handleChange} required>
                    <option value="" disabled>Select a patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
                <Input label="Amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
                <Input label="Payment Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                <Select label="Payment Method" name="method" value={formData.method} onChange={handleChange} required>
                    <option>Card</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                </Select>
                <Button type="submit" className="w-full">Record Payment</Button>
            </form>
        </Modal>
    );
};

// --- Form Element Components ---

const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

const Select = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            {children}
        </select>
    </div>
);

const Button = ({ children, className = '', ...props }) => (
    <button {...props} className={`bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow ${className}`}>
        {children}
    </button>
);


export default App;
