import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import './DebtsList.css';

const DebtsList = () => {
    const [debtors, setDebtors] = useState([]);
    const [selectedDebtor, setSelectedDebtor] = useState('');
    const [history, setHistory] = useState();
    const [addPaymentMode, setAddPaymentMode] = useState(false);
    const [payment, setPayment] = useState();

    useEffect(() => {
        axios.get(`${BASE_URL}/Debt/Debtors`)
            .then(response => {
                setDebtors(response.data);
                try {
                    setSelectedDebtor(response.data[0].name);
                }
                catch (error) {
                    console.log(error);
                }
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        setAddPaymentMode(false);

        if (selectedDebtor.length < 1) return;

        axios.get(`${BASE_URL}/Debt/Debtors/${selectedDebtor}`)
            .then(response => {
                setHistory(response.data);
            });
    }, [selectedDebtor])

    useEffect(() => {
        setPayment();
    }, [addPaymentMode])

    const onSelectedDebtorChange = (event) => {
        const newDebtor = event.target.value;

        setSelectedDebtor(newDebtor);
    }

    const setDigitFormat = (value) => {
        return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const sortHistory = () => {
        if (!history || !(history.payments && history.debts)) return null;

        const dates = [];
        Object.keys(history.debts).forEach(date => {
            dates.push(date);
        });

        Object.keys(history.payments).forEach(date => {
            dates.push(date);
        });

        const sortedDates = dates.sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);

            if (dateA > dateB) return -1;
            else if (dateA < dateB) return 1;
            else return 0;
        });

        const historyMapped = sortedDates.reduce((map, date) => {
            if (date in history.debts) {
                map.set(date, history.debts[date]);
            }
            else if (date in history.payments) {
                map.set(date, history.payments[date]);
            }

            return map;
        }, new Map());

        return historyMapped;
    }

    const getRemainingBalance = () => {
        let totalDebt = 0;
        let totalPayment = 0;

        if (history.debts) {
            Object.values(history.debts).forEach(debt => {
                if (debt && debt.purchases && Array.isArray(debt.purchases)) {
                    debt.purchases.forEach(purchase => {
                        if (purchase && purchase.count && purchase.product && purchase.product.price) {
                            totalDebt += purchase.count * purchase.product.price;
                        } else {
                            console.error('Invalid purchase object:', purchase);
                        }
                    });
                }
            });
        }

        if (history.payments) {
            totalPayment = Object.values(history.payments).reduce((acc, payment) => {
                return acc + payment;
            }, 0);
        }

        return totalDebt - totalPayment;
    }

    const formatDate = (date) => {
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };

        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    }

    const savePayment = async () => {
        if (payment !== 0) {
            try {
                await axios.post(`${BASE_URL}/Debt/Payment`, {
                    debtorName: selectedDebtor,
                    value: payment
                });

                axios.get(`${BASE_URL}/Debt/Debtors/${selectedDebtor}`)
                    .then(response => {
                        setHistory(response.data);
                    });

                toast.success('Payment saved!');
            } catch (error) {
                toast.error('Unable to save payment.');
                console.log(error);
            }
        }

        setAddPaymentMode(false);
    }

    const handlePaymentChange = (event) => {
        const value = event.target.value;
        setPayment(value);
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center ps-2 pe-2 mb-5 topdiv">
            <ToastContainer />
            <div className="top-div mt-4">
                {debtors && (
                    <select className="form-select" onChange={onSelectedDebtorChange }>
                        {debtors.map(debtor => (
                            <option key={debtor.name }>{debtor.name}</option>
                        ))}
                    </select>
                )}

                {history && (
                    <div className="mb-3 mt-4 d-flex flex-row">
                        <div>
                            <small>
                                Remaining Balance:
                            </small>
                        </div>
                        <div className="ms-auto">
                            <small className="me-1">
                                Php
                            </small>
                            <strong>
                                {setDigitFormat(getRemainingBalance()) }
                            </strong>
                        </div>
                    </div>
                )}

                {addPaymentMode ? (
                    <div className="d-flex flex-row w-100">
                        <input type="number" inputMode="numeric" className="form-control me-1" value={payment} onChange={handlePaymentChange} />
                        <button className="btn btn-outline-danger me-1" onClick={() => setAddPaymentMode(false) }>Cancel</button>
                        <button className="btn btn-success" onClick={(event) => savePayment(event) }>Save</button>
                    </div>
                ) : (
                    <div className="d-flex flex-row w-100">
                            <button className="btn btn-outline-primary w-100" onClick={() => setAddPaymentMode(true) }>Add payment</button>
                    </div>
                )}

                {history && Array.from(sortHistory()).map(([key, value]) => (
                    <div className="record" key={key}>
                        <div className="mb-2">
                            <strong>
                                {formatDate(key) }
                            </strong>
                        </div>
                        {value.purchases && value.purchases.map(purchase => (
                            <div className="d-flex flex-row" key={key }>
                                <div className="count">{purchase.count }</div>
                                <div>{purchase.product.name}</div>
                                <div className="ms-1"><small>{purchase.product.subtitle}</small></div>
                                <div className="ms-auto text-danger"><strong>{setDigitFormat(purchase.product.price * purchase.count)}</strong></div>
                            </div>
                        ))}

                        {!value.purchases && (
                            <div className={`d-flex flex-row ${value > 0 ? 'text-success' : 'text-danger'}`} key={key}>
                                <div className="count"><strong>{value > 0 ? 'PAID:' : 'BORROWED:'}</strong></div>
                                <div className="ms-auto"><strong>{setDigitFormat(value)}</strong></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DebtsList;