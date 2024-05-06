import React, { useState, useEffect } from 'react';
import 'chart.js/auto';
import { Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import randomColor from 'randomcolor';
import './Dashboard.css'

const Dashboard = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    const [summary, setSummary] = useState();
    const [graphData, setGraphData] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        getSaleSummary();
        weeklyLineGraph();
    }, [selectedDate]);

    const getSaleSummary = () => {
        const formattedDate = selectedDate.toISOString();

        axios.get(`https://localhost:7170/API/Purchase/Summary/${formattedDate}`)
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
        const date = new Date();
        const startDate = new Date(date.setDate(selectedDate.getDate() - 6)).toLocaleString('sv');
        const endDate = selectedDate.toLocaleString('sv');

        axios.get(`https://localhost:7170/API/Purchase/${startDate}~${endDate}`)
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
        const data =  {
            labels: dates,
            datasets: [
                {
                    data: Object.values(graphData.sales),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.3
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
    return (
        <div className="d-flex flex-column justify-content-center align-items-center topdiv">
            <div className="dashboard-wide mt-3 d-flex flex-row">
                <div className="ms-auto">
                    <span className="me-1">Select date:</span>
                    <small>(DD/MM/YYYY)</small>
                    <input type="date" className="form-control ms-auto dateinput" value={selectedDate.toISOString().split('T')[0]} onChange={handleDateChange} />
                </div>
            </div>
            <div className="d-flex flex-row justify-content-center align-items-center pt-3">
                <div className="dashboard me-2">
                    <div className="d-flex flex-row w-100">
                        <strong>Total Sales</strong>
                    </div>
                    {summary && (
                        <div className="d-flex flex-row w-100 mb-1 mt-3">
                            <span className="me-2">
                                Php
                            </span>
                            <h3>
                                {setDigitFormat(summary.saleForTheDay)}
                            </h3>
                        </div>
                    )}
                    <div className="mt-3">
                        {graphData && graphData.sales && (
                            <>
                                <div className="d-flex flex-row w-100">
                                    <span>
                                        Daily Average
                                    </span>
                                    <span className="ms-auto">
                                        <small className="me-1">Php</small>
                                        {setDigitFormat(graphData.average)}
                                    </span>
                                </div>
                                <Line data={chartData()} options={optionss} className="mt-5"/>
                            </>
                        )}
                    </div>
                </div>
                <div className="dashboard">
                    <div className="d-flex flex-column w-100">
                        <strong className="mb-4">Top Products</strong>
                        <div>
                            {getTopProductsData(5).map(product => (
                                <div className="top-product d-flex flex-row" key={Object.keys(product)[0]}>
                                    <span>
                                        {Object.values(product)[0].name}
                                        {Object.values(product)[0].subtitle && (
                                            <small className="ms-1">{Object.values(product)[0].subtitle}</small>
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
            <div className="dashboard dashboard-wide mt-2 h-100">
                <div className="d-flex flex-column w-100 purchase-list pb-3">
                    <strong className="mb-4">Purchases</strong>
                    {getProductsList().map(p => (
                        <div key={Object.keys(p)[0]} className="d-flex flex-row">
                            <strong className="me-2 pt">{Object.values(p)[0].count }</strong>
                            <span>
                                {Object.values(p)[0].name}
                                {Object.values(p)[0].subtitle && (
                                    <small className="ms-1">{Object.values(p)[0].subtitle}</small>
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