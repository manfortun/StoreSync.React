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
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
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
    }, [payment, barcode]);

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
        console.log(event.target.value);
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
                toast.success('Debt was charged successfully.');
                setPurchases([]);
                setPayment('');
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

    return (
        <div className="d-flex flex-column flex-lg-row p-4 topdiv mb-5">
            <ToastContainer />
            <DebtorModal isOpen={isModalOpen} onClose={closeModal} onDebtorSelected={onDebtorSelected} />
            <div className="pb-3 pe-lg-3 pt-0 col-lg-9 d-lg-flex flex-column justify-content-top align-items-center">
                <div className="cashier d-flex flex-lg-row flex-column">
                    <div className="mb-2 me-lg-4 d-flex flex-column col">
                        <div className="d-lg-flex d-none flex-column">
                            <input type="number" className="form-control mb-2 number" ref={inputRef} value={barcode} onChange={handleTap} inputMode="numeric" placeholder="Tap item in barcode scanner"></input>
                            <small>Tips:</small>
                            <small>1. Press [ Enter <BsArrowReturnLeft /> ] to focus on the barcode scanning textbox.</small>
                            <small>2. Press <BsArrowUp /><BsArrowDown /> to change [Payment] or [Purchase Quantity].</small>
                        </div>
                        <div className="d-flex flex-row mt-lg-auto align-items-center">
                            <span>Payment</span>
                            <input type="number" value={payment} min={0} className="ms-auto form-control payment number" inputMode="numeric" onChange={handlePaymentChange} disabled={purchases.length <= 0}></input>
                        </div>
                        <div className="d-flex flex-row mt-2">
                            <span><strong>TOTAL</strong></span>
                            <span className="ms-auto"><strong>{setDigitFormat(getTotal())}</strong></span>
                        </div>
                        <hr/>
                        <div className="d-flex flex-row">
                            <span>Change</span>
                            <span className="ms-auto">{isNaN(change) ? "---" : setDigitFormat(change)}</span>
                        </div>
                    </div>
                    <div className="col d-flex flex-column purchase-div">
                        <h3 className="mb-3"><BsReceipt className="me-2 text-secondary"/>Purchases</h3>
                        <div className="purchase-list">
                            {purchases.map((item, index) => (
                                <div className="purchase" key={item.id}>
                                    <div className="product d-flex flex-row">
                                        <input type="number" inputMode="numeric" value={item.count} className="product-count" onChange={(event) => handlePurchaseCountChange(item.id, event)} onKeyDown={(event) => handlePurchaseConfirmed(item.id, event)} placeholder="0" min={0 }></input>
                                        <div className="d-flex flex-column">
                                            <span className="me-1">{item.name}</span>
                                            <small>{item.subtitle}</small>
                                            <span className="badge rounded-pill bg-success align-self-start mt-2">Price: {setDigitFormat(item.price)}</span>
                                        </div>
                                        {isNaN(getProductTotal(item.id)) || getProductTotal(item.id) <= 0 ? (
                                            <small className="ms-auto text-danger d-flex align-items-center">Enter to remove</small>
                                        ) : (
                                                <div className="d-flex flex-column ms-auto justify-content-center align-items-end me-3">
                                                    <span>{setDigitFormat(getProductTotal(item.id))}</span>
                                                    <small>Total</small>
                                                </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {purchases.length > 0 && (
                            <div className="d-flex flex-row mt-auto">
                                <button className="btn btn-sm btn-outline-danger w-100 me-1" onClick={(event) => clearPurchases(event)}>{confirmDelete ? "Click to confirm" : "Delete"}</button>
                                <button className="btn btn-sm btn-outline-warning w-100 me-1" onClick={handleDebtPurchase }>
                                    {debtor.length < 1 ? (
                                        `Set as debt`
                                    ) : (
                                        `Debt to ${debtor}`
                                    )}
                                </button>
                                <button className="btn btn-sm btn-primary w-100" onClick={(event) => handleSavePurchases(event) }>Charge</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="col-lg-3 quickview">
                <div>
                    <input type="text" value={searchText} onChange={handleSearchTextChanged} onMouseDown={() => setSearchText('') } className="form-control mb-4" placeholder="Search an item or scan barcode..."></input>
                    <div className="p-2">
                        {searchedProduct && searchedProduct.map(p => (
                            <div className="d-flex flex-column mb-3 search-item" key={p.id}>
                                <div className="d-flex flex-row">
                                    <div className="d-flex flex-column">
                                        <strong>{p.name}</strong>
                                        <small className="st">{p.subtitle}</small>
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
                                <button onClick={handleTap} value={p.id } className="btn btn-outline-primary mt-3">Add</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Home;