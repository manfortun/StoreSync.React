import axios from 'axios';
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../../utils/constants';
import DebtorModal from '../modals/SelectDebtorModal';
import './Home.css';

const Home = () => {
    const [barcode, setBarcode] = useState('');
    const [payment, setPayment] = useState();
    const [change, setChange] = useState(0);
    const [purchases, setPurchases] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [searchedProduct, setSearchedProduct] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [debtor, setDebtor] = useState('');
    const [time, setTime] = useState(new Date());
    const [total, setTotal] = useState(0);
    const [registeredBarcodes, setRegisteredBarcodes] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        const getBarcodes = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/Product/GetBarcodes`);
                setRegisteredBarcodes(response.data);
            } catch {
                // FALLTHROUGH
            }
        }

        getBarcodes();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!document.activeElement.classList.contains('focusable')) {
                if (event.key === 'Enter') {
                    setBarcode('');
                }
                inputRef.current.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            axios.get(`${BASE_URL}/Product/keep-alive`).catch(console.error);
        }, 1 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (searchText.length <= 0) return setSearchedProduct(null);

        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/Product/Search/${searchText}`);
                setSearchedProduct(response.data);
            } catch {
                setSearchedProduct(null);
            }
        }

        fetchProduct();
    }, [searchText]);

    useEffect(() => {
        setConfirmDelete(false);
        setDebtor('');
    }, [purchases, searchText, payment, barcode]);

    useEffect(() => {
        setChange(payment - getTotal());
    }, [payment, barcode, purchases]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setTotal(getTotal());
    }, [total, purchases])

    const closeModal = () => setIsModalOpen(false);

    const handlePaymentChange = (event) => {
        const newPayment = parseFloat(event.target.value);
        if (newPayment <= 99999) {
            setPayment(newPayment);
        }
    }

    const setDigitFormat = (value) => value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleTap = async (event) => {
        const newBarcode = event.target.value;
        setBarcode(newBarcode);

        if (!registeredBarcodes.includes(newBarcode)) return;

        try {
            const response = await axios.get(`${BASE_URL}/Product/${newBarcode}`);
            addPurchase(response.data);
            setBarcode('');
        } catch {
            setBarcode('');
        }
    };

    const addPurchase = (purchase) => {
        const existingIndex = purchases.findIndex(item => item.id === purchase.id);

        if (existingIndex !== -1) {
            const updatedClassList = [...purchases];
            updatedClassList[existingIndex].count = (updatedClassList[existingIndex].count || 0) + 1;
            setPurchases(updatedClassList);
        } else {
            setPurchases(prevList => [...prevList, { ...purchase, count: 1}]);
        }
    }

    const handlePurchaseCountChange = (id, event) => {
        const updatedList = purchase.map(item => item.id === id ? { ...item, count: parseInt(event.target.value, 10) } : item);
        setPurchases(updatedList);
    }

    const handlePurchaseConfirmed = (id, event) => {

        if (event.key !== 'Enter') return;

        const value = event.target.value;

        if (!value || value === '0') {
            setPurchases(purchases.filter(p => p.id !== id));
        }
    }

    const getTotal = () => purchases.reduce((total, item) => total + ((item.count || 0) * item.price), 0);

    const handleSearchTextChanged = (event) => {
        setSearchText(event.target.value);
    }

    const getProductTotal = (id) => {
        const product = purchases.find(p => p.id === id);
        return product ? (product.count * product.price) : 0;
    }

    const clearPurchases = () => {
        if (confirmDelete === true) {
            setPurchases([]);
            setPayment('');
            setSearchText('');
        } else {
            setConfirmDelete(true);
        }
    }

    const handleSavePurchases = async (event) => {
        event.preventDefault();

        const filteredPurchases = purchases.filter(p => p.count > 0);

        if (filteredPurchases.length < 1) {
            setPurchases([]);
            setPayment('');
            return;
        }

        const newSalesData = filteredPurchases.map(purchase => ({
            productid: purchase.id,
            count: purchase.count
        }));

        try {
            await axios.post(`${BASE_URL}/Purchase`, { purchases: newSalesData });

            toast.success('Earned Php ' + setDigitFormat(getTotal()));
            setPurchases([]);
            setPayment('');
            setSearchText('');
        } catch {
            toast.error('Something went wrong. Contact administrator');
        }
    }

    const handleDebtPurchase = async (event) => {
        event.preventDefault();

        if (!debtor) {
            setIsModalOpen(true);
            return;
        }

        const newSalesData = purchases.map(purchase => ({
            productid: purchase.id,
            count: purchase.count
        }));

        try {
            await axios.post(`${BASE_URL}/Debt`, {
                debtorName: debtor,
                debt: { purchases: newSalesData }
            });

            toast.success(`Debt was charged successfully to ${debtor}.`);
            setPurchases([]);
            setPayment('');
            setSearchText('');
        } catch {
            toast.error('Something went wrong. Contact administrator.');
        }
    };

    const onDebtorSelected = (debtorName) => {
        if (debtorName) {
            setDebtor(debtorName);
            setIsModalOpen(false);
        }
    };

    const formatDate = (date) => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(date));

    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\s[AP]M/, '');

    return (
        <div className="d-flex flex-column flex-lg-row p-4 topdiv mb-5">
            <input type="number" className="number hidden-control" ref={inputRef} value={barcode} onChange={handleTap} inputMode="numeric"/>
            <ToastContainer />
            <DebtorModal isOpen={isModalOpen} onClose={closeModal} onDebtorSelected={onDebtorSelected} />
            <div className="pb-3 pe-lg-3 pt-0 col-lg-9 d-lg-flex flex-column align-items-center">
                <div className={purchases.length <= 0 ? "cashier d-flex flex-column bg-design" : "cashier d-flex flex-column"}>
                {purchases.length > 0 ? (
                    <>
                        <div className="purchase-list">
                            {purchases.map(item => (
                                <div key={item.id} className="purchase">
                                    <div className="col-1 d-flex flex-row justify-content-center">
                                        <input type="number" inputMode="numeric" value={item.count} className="product-count focusable" onChange={(event) => handlePurchaseCountChange(item.id, event)} onKeyDown={(event) => handlePurchaseConfirmed(item.id, event)} placeholder="0" min={0}></input>
                                    </div>
                                    <div className="col-7">
                                        <strong>{item.name}</strong>
                                        {item.subtitle && item.subtitle.length > 0 && (<small className="d-none d-lg-inline"> , {item.subtitle}</small>)}
                                    </div>
                                    <div className="col-1 d-flex flex-row justify-content-end">
                                        <span>{setDigitFormat(item.price)}</span>
                                    </div>
                                    <div className="col-3 d-flex flex-row justify-content-end">
                                        {isNaN(getProductTotal(item.id)) || getProductTotal(item.id) <= 0 ? (
                                            <small className="text-danger right-align">Enter to remove</small>
                                        ) : (
                                            <strong>{setDigitFormat(getProductTotal(item.id))}</strong>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {purchases.length > 0 && (
                            <div className="d-flex flex-column mt-auto p-4">
                                <div className="d-flex flex-row mb-3">
                                    <button className="btn btn-sm btn-outline-danger me-1 order-btn" onClick={(event) => clearPurchases(event)}>{confirmDelete ? "Click to confirm" : "Delete Order"}</button>
                                    <button className="btn btn-sm btn-outline-warning me-1 me-md-3 ms-auto order-btn" onClick={handleDebtPurchase}>
                                        {debtor.length < 1 ? (
                                            `Save as debt`
                                        ) : (
                                            `Debt to ${debtor}`
                                        )}
                                    </button>
                                    <button className="btn btn-sm btn-outline-primary order-btn" onClick={(event) => handleSavePurchases(event)}>Save Order</button>
                                </div>
                                <div className="d-flex flex-lg-row flex-column mt-4">
                                    <div>
                                        <div className="d-flex flex-row mt-lg-auto align-items-center fs-3">
                                            <span className="me-4">Payment:</span>
                                            <input type="number" value={payment} min={0} className="ms-auto form-control payment number focusable fs-3" inputMode="numeric" onChange={handlePaymentChange} disabled={purchases.length <= 0}></input>
                                        </div>
                                        <div className="d-flex flex-row fs-3">
                                            <span>Change:</span>
                                            <span className="ms-auto">{isNaN(change) || change < 0 ? "---" : setDigitFormat(change)}</span>
                                        </div>
                                    </div>
                                        <div className="ms-auto d-flex flex-column align-items-end">
                                        <span className="total">{setDigitFormat(total)}</span>
                                        <small>Total</small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                    ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white">
                                <strong className="time">
                                    {formatTime(time) }
                                </strong>
                                <div className="d-flex flex-row justify-content-center align-items-center w-100">
                                    {Array.from({ length: 60 }, (_, index) => index).map(sec => (
                                        <div className="counter-div" key={sec }>
                                            <div className={time.getSeconds() < sec ? "rounded-pill counter" : "rounded-pill counter active"}/>
                                        </div>
                                    )) }
                                </div>
                                <h1 className="mt-3">
                                    {formatDate(time) }
                                </h1>
                            </div>
                    )}
                </div>
            </div>
            <div className="col-lg-3 quickview">
                <div>
                    <input type="text" value={searchText} onChange={handleSearchTextChanged} onMouseDown={() => setSearchText('')} className="form-control focusable" placeholder="Search an item or scan barcode..."></input>
                    {searchedProduct && searchedProduct.map(p => (
                        <div className="d-flex flex-column search-item" key={p.id}>
                            <button onClick={handleTap} value={p.id} className="btn">
                                <div className="d-flex flex-row non-clickable">
                                    <div className="d-flex flex-column align-items-start">
                                        <strong>{p.name}</strong>
                                        <small className="st text-primary">{p.subtitle}</small>
                                    </div>
                                    <div className="ms-auto d-flex flex-row">
                                        <small className="st me-1">
                                            Php
                                        </small>
                                        <h5>
                                            {setDigitFormat(p.price)}
                                        </h5>
                                    </div>
                                </div>
                            </button>
                            {/*<button onClick={handleTap} value={p.id } className="btn btn-outline-primary mt-3">Add</button>*/}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default Home;