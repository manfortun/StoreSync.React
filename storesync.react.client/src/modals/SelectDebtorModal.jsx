import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import './SelectDebtorModal.css'

function DebtorModal({ isOpen, onClose, onDebtorSelected }) {
    const [debtors, setDebtors] = useState([]);
    const [selectedDebtorName, setSelectedDebtorName] = useState('');

    useEffect(() => {
        axios.get(`${BASE_URL}/Debt/Debtors`)
            .then(response => {
                setDebtors(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [])

    const handleSelectedDebtorNameChange = (event) => {
        const value = event.target.value;

        setSelectedDebtorName(value);
    }

    const filterDebtors = () => {
        if (!debtors) return null;

        if (selectedDebtorName.length < 1) return debtors;

        return debtors.filter(d => {
            return d.name.toLowerCase().includes(selectedDebtorName.toLowerCase());
        });
    }

    const setNewDebtor = (event) => {
        if (event.key !== 'Enter') return;

        const newDebtor = event.target.value;

        if (newDebtor.length < 1) return;

        onDebtorSelected(newDebtor);
    }

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose}>
            <div className="d-flex flex-column">
                <div>Select debtor</div>
                <div className="form-floating mb-3">
                    <input type="text" className="form-control" value={selectedDebtorName} onChange={handleSelectedDebtorNameChange} onKeyDown={setNewDebtor} id="floatingInput" placeholder="Enter debtor's name" />
                    <label htmlFor="floatingInput">Debtor's Name</label>
                </div>
                <ul>
                    {filterDebtors().map(debtor => (
                        <li><a href="#" className="text-black fs-3" onClick={() => onDebtorSelected(debtor.name) }>{debtor.name}</a></li>
                    )) }
                </ul>
                <button onClick={onClose} className="btn btn-sm mt-auto">Close Modal</button>
            </div>
        </Modal>
    );
}

export default DebtorModal;