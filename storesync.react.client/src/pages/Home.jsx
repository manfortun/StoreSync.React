import axios from 'axios';
import React, { useEffect, useRef, useState } from "react";
import { BsArrowDown, BsArrowReturnLeft, BsArrowUp, BsReceipt } from 'react-icons/bs';
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
    const [salesForTheDay, setSalesForTheDay] = useState(0);
    const [total, setTotal] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!document.activeElement.classList.contains('focusable')) {
                inputRef.current.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (searchText.length <= 0) return setSearchedProduct(null);

        axios.get(`${BASE_URL}/Product/Search/${searchText}`)
            .then(response => {
                setSearchedProduct(response.data);
            })
            .catch(() => {
                setSearchedProduct(null);
            });
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
        const interval = setInterval(() => {
            getSalesForTheDay();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const newTotal = getTotal();
        const diff = newTotal - total;
        const abs = Math.abs(diff);
        const mult = diff < 0 ? -1 : 1;

        if (abs > 100.01) setTotal(total + 90.01 * mult);
        else if (abs > 90.01) setTotal(total + 80.01 * mult);
        else if (abs > 80.01) setTotal(total + 70.01 * mult);
        else if (abs > 70.01) setTotal(total + 60.01 * mult);
        else if (abs > 60.01) setTotal(total + 50.01 * mult);
        else if (abs > 50.01) setTotal(total + 40.01 * mult);
        else if (abs > 40.01) setTotal(total + 30.01 * mult);
        else if (abs > 30.01) setTotal(total + 20.01 * mult);
        else if (abs > 20.01) setTotal(total + 10.01 * mult);
        else if (abs > 10.01) setTotal(total + 9.01 * mult);
        else if (abs > 5.01) setTotal(total + 2.01 * mult);
        else if (abs > 1.01) setTotal(total + 0.10 * mult);
        else if (abs > 0.01) setTotal(total + 0.01 * mult);
        else setTotal(newTotal);

    }, [total, purchases])

    const closeModal = () => setIsModalOpen(false);

    const handlePaymentChange = (event) => {
        const newPayment = parseFloat(event.target.value);
        if (newPayment > 99999) return;
        setPayment(newPayment);
    }

    const setDigitFormat = (value) => {
        return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const handleTap = (event) => {
        const newBarcode = event.target.value;
        setBarcode(newBarcode);

        if (newBarcode.length < 1) return;

        axios.get(`${BASE_URL}/Product/${newBarcode}`)
            .then(response => {
                addPurchase(response.data);
                setBarcode('');
            });
    }

    const addPurchase = (purchase) => {
        const existingIndex = purchases.findIndex(item => item.id == purchase.id);

        if (existingIndex !== -1) {
            const updateClassList = [...purchases];
            if (isNaN(updateClassList[existingIndex].count)) {
                updateClassList[existingIndex].count = 0;
            }

            updateClassList[existingIndex].count += 1;
            setPurchases(updateClassList);
        } else {
            setPurchases(prevList => [...prevList, { name: purchase.name, count: 1, price: purchase.price, subtitle: purchase.subtitle, id: purchase.id }]);
        }
    }

    const handlePurchaseCountChange = (id, event) => {
        const existingIndex = purchases.findIndex(p => p.id === id);

        if (existingIndex !== -1) {
            const updatedList = [...purchases];
            updatedList[existingIndex].count = parseInt(event.target.value, 10);
            setPurchases(updatedList);
        }
    }

    const handlePurchaseConfirmed = (id, event) => {

        if (event.key !== 'Enter') return;

        const value = event.target.value;

        if (value.length <= 0 || value === '0') {
            const existingIndex = purchases.findIndex(p => p.id === id);
            if (existingIndex !== -1) {
                const updatedList = purchases.filter(p => p.id !== id);
                setPurchases(updatedList);
            }
        }
    }

    const getTotal = () => {
        return purchases.reduce((total, item) => total + (isNaN(item.count) ? 0 : item.count) * item.price, 0);
    }

    const handleSearchTextChanged = (event) => {
        const value = event.target.value;
        setSearchText(value);
    }

    const getProductTotal = (id) => {
        const existingIndex = purchases.findIndex(p => p.id === id);

        if (existingIndex !== -1) {
            const p = purchases[existingIndex];
            return p.count * p.price;
        }

        return 0;
    }

    const clearPurchases = (event) => {
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

        let filteredPurchases = purchases.filter((p) => {
            return p.count > 0
        });

        if (filteredPurchases.length < 1) {
            setPurchases([]);
            setPayment('');
            return;
        }

        const newSalesData = filteredPurchases.map((purchase) => ({
            productid: purchase.id,
            count: purchase.count
        }));

        try {
            await axios.post(`${BASE_URL}/Purchase`, { purchases: newSalesData });

            toast.success('Earned Php ' + setDigitFormat(getTotal()));
            setPurchases([]);
            setPayment('');
            setSearchText('');
        } catch (error) {
            console.log(error);

            toast.error('Something went wrong. Contact administrator');
        }
    }

    const handleDebtPurchase = async (event) => {
        event.preventDefault();

        if (debtor.length < 1) {
            setIsModalOpen(true);
        } else {
            const newSalesData = purchases.map((purchase) => ({
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
            } catch (error) {
                console.log(error);

                toast.error('Something went wrong. Contact administrator');
            }
        }
    }

    const onDebtorSelected = (debtorName) => {
        if (debtorName.length < 1) return;

        setIsModalOpen(false);
        setDebtor(debtorName);
    }

    const formatDate = (date) => {
        const options = {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        };

        return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\s[AP]M/, '');
    }

    const getSalesForTheDay = () => {
        axios.get(`${BASE_URL}/Purchase/GetSalesForTheDay`)
            .then(response => {
                setSalesForTheDay(response.data);
            })
            .catch(error => {
                setSalesForTheDay(0);
            });
    }

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
                                        <div className={time.getSeconds() < sec ? "rounded-pill counter" : "rounded-pill counter active"} key={sec}/>
                                    )) }
                                </div>
                                <h1>
                                    {formatDate(time) }
                                </h1>
                                <div className="sales-day mt-5">
                                    <h1 className="fs-1 text-white">Php {setDigitFormat(salesForTheDay)}</h1>
                                    <small className="text-white">Sales for today</small>
                                </div>
                            </div>
                    )}
                </div>
            </div>
            <div className="col-lg-3 quickview">
                <div>
                    <input type="text" value={searchText} onChange={handleSearchTextChanged} onMouseDown={() => setSearchText('')} className="form-control focusable" placeholder="Search an item or scan barcode..."></input>
                    {searchedProduct && searchedProduct.map(p => (
                        <div className="d-flex flex-column search-item mt-3" key={p.id}>
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