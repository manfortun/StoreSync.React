import React, { useState, useEffect } from "react";
import { BsReceipt } from 'react-icons/bs';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import { BARCODE_LENGTH } from "../constants";
import axios from 'axios';
import './Home.css';

const Home = () => {
    const [barcode, setBarcode] = useState('');
    const [payment, setPayment] = useState();
    const [change, setChange] = useState(0);
    const [purchases, setPurchases] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        axios.get('https://localhost:7170/API/Product')
            .then(response => {
                setProducts(response.data);
            });
    }, [])

    const handlePaymentChange = (event) => {
        const newPayment = parseFloat(event.target.value);
        if (newPayment > 99999) return;
        setPayment(newPayment);
        setChange(newPayment - getTotal());

        setConfirmDelete(false);
    }

    const setDigitFormat = (value) => {
        return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const handleTap = (event) => {
        const newBarcode = event.target.value;
        setBarcode(newBarcode);

        if (newBarcode.length < BARCODE_LENGTH) return;

        const existingIndex = products.findIndex(item => item.id == newBarcode);

        if (existingIndex !== -1) {
            addPurchase(products[existingIndex])
        } else {
            console.log('No such item');
            toast.error('This item is not registered.');
        }

        setChange(payment - getTotal());
        setBarcode('');
        setConfirmDelete(false);
    }

    const addPurchase = (purchase) => {
        const existingIndex = purchases.findIndex(item => item.id == purchase.id);

        if (existingIndex !== -1) {
            const updateClassList = [...purchases];
            updateClassList[existingIndex].count += 1;
            setPurchases(updateClassList);
        } else {
            setPurchases(prevList => [...prevList, { name: purchase.name, count: 1, price: purchase.price, subtitle: purchase.subtitle, id: purchase.id }]);
        }
        setConfirmDelete(false);
    }

    const handlePurchaseCountChange = (id, event) => {
        const existingIndex = purchases.findIndex(p => p.id === id);

        if (existingIndex !== -1) {
            const updatedList = [...purchases];
            updatedList[existingIndex].count = parseInt(event.target.value, 10);
            setPurchases(updatedList);
        }
        console.log(event.target.value);
        setConfirmDelete(false);
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
        setConfirmDelete(false);
    }

    const getTotal = () => {
        return purchases.reduce((total, item) => total + item.count * item.price, 0);
    }

    const applySearchText = () => {
        if (searchText.length <= 0) return products;

        const searchTextLower = searchText.toLowerCase();

        return products.filter(product => {
            return (
                product.id.startsWith(searchTextLower) ||
                product.id.endsWith(searchTextLower) ||
                product.name.toLowerCase().includes(searchTextLower) ||
                product.subtitle.toLowerCase().includes(searchTextLower)
            );
        });
    }

    const handleSearchTextChanged = (event) => {
        const value = event.target.value;
        setSearchText(value);
        setConfirmDelete(false);
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
            setConfirmDelete(false);
        } else {
            setConfirmDelete(true);
        }
    }

    const handleSavePurchases = async (event) => {
        event.preventDefault();

        const newSalesData = purchases.map((purchase) => ({
            productid: purchase.id,
            count: purchase.count
        }));

        try {
            const response = await axios.post('https://localhost:7170/API/Purchase', { purchases: newSalesData });

            toast.success('Earned Php ' + setDigitFormat(getTotal()));
            setPurchases([]);
        } catch (error) {
            console.log(error);

            toast.error('Something went wrong. Contact administrator');
        }
    }

    return (
        <div className="row p-4">
        <ToastContainer />
            <div className="p-3 pt-0 col-9 d-flex flex-column justify-content-top align-items-center">
                <div className="cashier row">
                    <div className="mb-2 me-4 d-flex flex-column col">
                        <input type="number" className="form-control mb-2 number" value={barcode} onChange={handleTap} inputMode="numeric" placeholder="Tap item in barcode scanner"></input>
                        <div className="d-flex flex-row mt-auto align-items-center">
                            <span>Payment</span>
                            <input type="number" value={payment} className="ms-auto form-control payment number" inputMode="numeric" onChange={handlePaymentChange} disabled={purchases.length <= 0}></input>
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
                                        <input type="number" inputMode="numeric" value={item.count} className="product-count" onChange={(event) => handlePurchaseCountChange(item.id, event)} onKeyDown={(event) => handlePurchaseConfirmed(item.id, event) }></input>
                                        <span className="me-1">{item.name} <small>{item.subtitle}</small></span>
                                        <span> @ {setDigitFormat(item.price)}</span>
                                        {isNaN(getProductTotal(item.id)) || getProductTotal(item.id) <= 0 ? (
                                            <small className="ms-auto text-danger d-flex align-items-center">Enter to remove</small>
                                        ) : (
                                            <span className="ms-auto">{setDigitFormat(getProductTotal(item.id))}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {purchases.length > 0 && (
                            <div className="d-flex flex-row mt-auto">
                                <button className="btn btn-sm btn-outline-danger w-100 me-1" onClick={(event) => clearPurchases(event) }>{ confirmDelete ? "Click to confirm" : "Delete" }</button>
                                <button className="btn btn-sm btn-primary w-100" onClick={(event) => handleSavePurchases(event) }>Save</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="col-3 quickview">
                <div>
                    <input type="text" value={searchText} onChange={handleSearchTextChanged} className="form-control mb-4" placeholder="Search an item or scan barcode..."></input>
                    <div className="p-2">
                        {products && applySearchText().map((product, index) => (
                            <div key={product.id} className="d-flex flex-row mb-2">
                                <span className="me-2 d-flex flex-row"><div className="me-1 pname">{product.name}</div><small className="st">{product.subtitle}</small></span>
                                <span>@ { setDigitFormat(product.price) }</span>
                                <button onClick={handleTap} value={product.id } className="btn btn-outline-primary ms-auto">Add</button>
                            </div>
                        )) }
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Home;