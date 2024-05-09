import React, { useEffect, useState } from 'react';
import { BsCalendar, BsCash, BsBrightnessHigh } from 'react-icons/bs';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import './DailySales.css';
import { Link } from 'react-router-dom';
import Dashboard from './Dashboard';

const DailySales = () => {
    const [dailySales, setDailySales] = useState(null);
    const [includeDebts, setIncludeDebts] = useState(false);

    useEffect(() => {
        axios.get(`${BASE_URL}/Purchase/DailySales`)
            .then(response => {
                setDailySales(response.data);
            });
    }, []);

    const formatDate = (date) => {
        const options = {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
        };

        return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
    }

    const setDigitFormat = (value) => {
        return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const getRecords = () => {
        const dates = Object.keys(dailySales.sales).sort((a, b) => {
            if (a > b) return -1;
            if (a < b) return 1;
            else return 0;
        });

        const records = dates.map(date => {
            return {
                    date: date,
                    sale: dailySales.sales[date] ?? 0,
                    debt: dailySales.debts[date] ?? 0,
                    payment: dailySales.payments[date] ?? 0
                };
        });

        return records;
    }

    const getCompoundedDebt = (date) => {
        const dates = Object.keys(dailySales.sales).sort((a, b) => {
            if (a > b) return -1;
            if (a < b) return 1;
            else return 0;
        });

        const records = dates.filter(d => d <= date).map(date => {
            return {
                debt: dailySales.debts[date] ?? 0,
                payment: dailySales.payments[date] ?? 0
            };
        });

        var outstandingDebt = records.reduce((debt, rec) => {
            return debt + rec.debt - rec.payment;
        }, 0);

        return outstandingDebt;
    }

    const handleIncludeDebtsChanged = () => {
        setIncludeDebts(!includeDebts);
    }

    return (
        (dailySales && (
            <div className="d-flex flex-column justify-content-start align-items-center pt-3 pb-5 overflow-y-auto">
                <h3>Daily Sales</h3>
                <div className="d-flex flex-row justify-content-center align-items-center p-3">
                    <div className="summary s-1">
                        <BsCash className="mb-2 icon"/>
                        <strong>Total Sales</strong>
                        <div className="value">
                            {dailySales.totalSales }
                        </div>
                    </div>
                    <div className="summary s-2">
                        <BsCalendar className="mb-2 icon" />
                        <strong>No. of Days</strong>
                        <div className="value">
                            {dailySales.noOfDays }
                        </div>
                    </div>
                    <div className="summary s-3">
                        <BsBrightnessHigh className="mb-2 icon" />
                        <strong>Average Sale</strong>
                        <div className="value">
                            {dailySales.averageSale }
                        </div>
                    </div>
                </div>
                <div className="dsl p-2">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" value={includeDebts} onChange={handleIncludeDebtsChanged} />
                        <label class="form-check-label text-secondary mb-3" for="flexSwitchCheckDefault">Include debts and payments</label>
                    </div>
                    {getRecords().map(record => (
                        <Link key={record.date} to={`/dashboard/${record.date}`} className={includeDebts ? "d-flex flex-column w-100 entry" : "d-flex flex-row w-100 entry" }>
                            <strong className={includeDebts ? "mb-2" : "" }>{formatDate(record.date)}</strong>
                            {includeDebts ? (
                                <>
                                    <div className="d-flex flex-row">
                                        Normal sale:
                                        <strong className="ms-auto">
                                            {setDigitFormat(record.sale)}
                                        </strong>
                                    </div>
                                    <div className="d-flex flex-row text-success">
                                        Payment:
                                        <div className="ms-auto">
                                            {setDigitFormat(record.payment)}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-row text-danger">
                                        <div>
                                            Debt:
                                        </div>
                                    </div>
                                    <div className="d-flex flex-row align-items-baseline">
                                        <small className="ms-1">(new)</small>
                                        <div className="ms-auto text-danger">
                                            {setDigitFormat(record.debt)}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-row align-items-baseline">
                                        <small className="ms-1">(remaining)</small>
                                        <div className="ms-auto text-danger">
                                            {setDigitFormat(getCompoundedDebt(record.date))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                    <div className="ms-auto">{setDigitFormat(record.sale)}</div>
                            ) }
                        </Link>
                    ))}
                </div>
            </div>
        ))
    )
}

export default DailySales;