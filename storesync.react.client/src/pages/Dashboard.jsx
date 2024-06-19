import axios from 'axios';
import 'chart.js/auto';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { BsListOl, BsPiggyBankFill, BsTrophyFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
    let { date } = useParams();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    const [summary, setSummary] = useState();
    const [graphData, setGraphData] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date(date));

    useEffect(() => {
        getSaleSummary();
        weeklyLineGraph();
    }, [selectedDate]);

    const getSaleSummary = () => {
        const formattedDate = selectedDate.toLocaleString('sv');

        axios.get(`${BASE_URL}/Purchase/Summary/${formattedDate}`)
            .then(response => {
                setSummary(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    const setDigitFormat = (value) => {
        return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const weeklyLineGraph = () => {
        const date = new Date(selectedDate);
        const startDate = new Date(date.setDate(selectedDate.getDate() - 6)).toLocaleString('sv');
        const endDate = selectedDate.toLocaleString('sv');

        axios.get(`${BASE_URL}/Purchase/${startDate}~${endDate}`)
            .then(response => {
                setGraphData(response.data);
            });
    }

    const getDayName = (dateString) => {
        const date = new Date(dateString);
        const dayIndex = date.getDay();
        const dayName = daysOfWeek[dayIndex];

        return dayName;
    };

    const chartData = () => {
        const keys = Object.keys(graphData.sales);
        const dates = Array.from(keys).map(getDayName);
        const data = {
            labels: dates,
            datasets: [
                {
                    data: Object.values(graphData.sales),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.3
                },
                {
                    data: Object.values(graphData.debts),
                    fill: false,
                    borderColor: 'rgb(229, 75, 91)',
                    tension: 0
                }
            ]
        };

        return data;
    }

    const handleDateChange = (event) => {
        const date = event.target.value;

        setSelectedDate(new Date(date));
    }

    const getTopProductsData = (count) => {
        if (!summary || !summary.productSales) return [];

        const entries = Object.entries(summary.productSales);

        const sorted = entries.sort((a, b) => b[1].total - a[1].total);

        const ranked = sorted.slice(0, count);

        return ranked.map(([key, value]) => ({
            [key]: {
                name: value.name,
                subtitle: value.subtitle,
                count: value.count,
                total: value.total,
            }
        }));
    }

    const getCurrentSale = () => {
        if (!graphData || !graphData.sales) return 0;

        let saleOfTheDay;
        let maxDate;

        for (const [date, obj] of Object.entries(graphData.sales)) {
            if (!maxDate || date > maxDate) {
                maxDate = date;
                saleOfTheDay = obj;
            }
        }

        return saleOfTheDay;
    }

    const getCurrentDebt = () => {
        if (!graphData || !graphData.sales) return 0;

        let currentDebt;
        let maxDate;

        for (const [date, obj] of Object.entries(graphData.debts)) {
            if (!maxDate || date > maxDate) {
                maxDate = date;
                currentDebt = obj;
            }
        }

        return currentDebt;
    }

    const getProductsList = () => {
        if (!summary || !summary.productSales) return [];

        const entries = Object.entries(summary.productSales);

        const sorted = entries.sort((a, b) => {
            if (a[1].name < b[1].name) return -1;
            if (a[1].name > b[1].name) return 1;
            if (a[1].subtitle < b[1].subtitle) return -1;
            if (a[1].subtitle > b[1].subtitle) return 1;
            return 0;
        });

        const mapped = sorted.map(([key, value]) => ({
            [key]: {
                name: value.name,
                subtitle: value.subtitle,
                count: value.count,
                total: value.total,
            }
        }));

        return mapped;
    }

    const optionss = {
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                display: false,
                grid: {
                    display: false
                }
            }
        }
    };

    const formatDate = (date) => {
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        };

        return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
    }

    return (
        <div className="d-flex flex-column justify-md-content-center align-items-center topdiv mb-5">
            <div className="dashboard-wide mt-3 d-flex flex-row">
                <h4>{formatDate(selectedDate)}</h4>
            </div>
            <div className="d-flex flex-md-row flex-column justify-content-center align-items-center pt-3">
                <div className="dashboard me-md-2 me-0">
                    <div className="d-flex flex-row w-100">
                        <div className="d-flex flex-row mb-2 align-items-center">
                            <BsPiggyBankFill className="me-2 text-success" />
                            <strong>Earnings</strong>
                        </div>
                    </div>
                    {graphData && (
                        <>
                            <div className="d-flex flex-row w-100 mb-1 mt-3">
                                <span className="me-2">
                                    Php
                                </span>
                                <h3>
                                    <strong>
                                        {setDigitFormat(getCurrentSale())}
                                    </strong>
                                </h3>
                            </div>
                            <div className="mt-2">
                                <div className="d-flex flex-row w-100">
                                    <span>
                                        Average Sale
                                    </span>
                                    <span className="ms-auto">
                                        <small className="me-1">Php</small>
                                        {setDigitFormat(graphData.average)}
                                    </span>
                                </div>
                                <div className="d-flex flex-row w-100">
                                    <span>
                                        Remaining Debt
                                    </span>
                                    <span className="ms-auto">
                                        <small className="me-1">Php</small>
                                        <span className={getCurrentDebt() < 1 ? "" : "text-danger"}>
                                            {setDigitFormat(getCurrentDebt())}
                                        </span>
                                    </span>
                                </div>
                                <Line data={chartData()} options={optionss} className="mt-4"/>
                            </div>
                        </>
                    )}
                </div>
                <div className="dashboard mt-2 mt-md-0">
                    <div className="d-flex flex-column w-100">
                        <div className="d-flex flex-row mb-4 align-items-center">
                            <BsTrophyFill className="me-2 text-warning"/>
                            <strong>Top Products</strong>
                        </div>
                        <div>
                            {getTopProductsData(5).map(product => (
                                <div className="top-product d-flex flex-row" key={Object.keys(product)[0]}>
                                    <span className="d-flex flex-row">
                                        <div className="ellipsis" title={Object.values(product)[0].name }>
                                            {Object.values(product)[0].name}
                                        </div>
                                        {Object.values(product)[0].subtitle && (
                                            <div className="ellipsis" title={Object.values(product)[0].subtitle }>
                                                <small className="ms-1">{Object.values(product)[0].subtitle}</small>
                                            </div>
                                        )}
                                    </span>
                                    <div className="ms-auto">
                                        <small>Php</small> {setDigitFormat(Object.values(product)[0].total)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="dashboard dashboard-wide mt-2 mb-5">
                <div className="d-flex flex-column w-100 pb-3">
                    <div className="d-flex flex-row mb-4 align-items-center">
                        <BsListOl className="me-2" />
                        <strong>Purchases</strong>
                    </div>
                    {getProductsList().map(p => (
                        <div key={Object.keys(p)[0]} className="d-flex flex-row">
                            <strong className="me-2 pt">{Object.values(p)[0].count}</strong>
                            <span className="d-flex flex-row">
                                <div className="ellipsis" title={Object.values(p)[0].name}>
                                    {Object.values(p)[0].name}
                                </div>
                                {Object.values(p)[0].subtitle && (
                                    <div className="ellipsis" title={Object.values(p)[0].subtitle}>
                                        <small className="ms-1">{Object.values(p)[0].subtitle}</small>
                                    </div>
                                )}
                            </span>
                            <div className="ms-auto">
                                {setDigitFormat(Object.values(p)[0].total) }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;