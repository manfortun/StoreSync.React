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
    const [topProducts, setTopProducts] = useState();

    useEffect(() => {
        getSaleSummary();
        weeklyLineGraph();
    }, [selectedDate]);

    useEffect(() => {
        getTopProductsSummary();
    }, []);

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

    const getTopProductsSummary = () => {
        axios.get('https://localhost:7170/API/Purchase/TopProducts')
            .then(response => {
                setTopProducts(response.data);
            });
    }

    const setDigitFormat = (value) => {
        return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const weeklyLineGraph = () => {
        const date = new Date();
        const startDate = new Date(date.setDate(selectedDate.getDate() - 6)).toISOString();
        const endDate = selectedDate.toISOString();

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
        if (!topProducts || !topProducts.products) return [];

        const entries = Object.entries(topProducts.products);

        entries.sort((a, b) => b[1] - a[1]);

        const ranked = Object.fromEntries(entries.slice(0, count));

        return Object.entries(ranked).map(([key, value]) => ({
            [key]: { name: topProducts.productNames[key], value }
        }));
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
        <div className="d-flex flex-row justify-content-center align-items-center pt-5">
            <div className="dashboard me-2">
                <div className="d-flex flex-row w-100">
                    <strong>Total Sales</strong>
                    <input type="date" className="form-control ms-auto dateinput" value={selectedDate.toISOString().split('T')[0]} onChange={handleDateChange} />
                </div>
                {summary && (
                    <>
                        <div className="d-flex flex-row w-100 mb-4 mt-3">
                            <span className="me-2">
                                Php
                            </span>
                            <h3>
                                {setDigitFormat(summary.saleForTheDay)}
                            </h3>
                        </div>
                        <div className="d-flex flex-row w-100">
                            <span>
                                Daily Average
                            </span>
                            <span className="ms-auto">
                                <small className="me-1">Php</small>
                                {setDigitFormat(summary.dailyAverage)}
                            </span>
                        </div>
                    </>
                )}
                <div className="mt-5">
                    {graphData && graphData.sales && (
                        <Line data={chartData()} options={optionss} />
                    )}
                </div>
            </div>
            <div className="dashboard">
                <div className="d-flex flex-column w-100">
                    <strong className="mb-4">Top Products</strong>
                    <div>
                        {getTopProductsData(5).map(product => (
                            <div className="top-product d-flex flex-row" key={Object.keys(product)[0]}>
                                {Object.values(product)[0].name}
                                <div className="ms-auto">
                                    <small>Php</small> {setDigitFormat(Object.values(product)[0].value)}
                                </div>
                            </div>
                        )) }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;