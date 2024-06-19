import axios from 'axios';
import React, { useState } from 'react';
import { BsUpcScan } from 'react-icons/bs';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../../utils/constants';
import './Register.css';

const Register = () => {
    const [update, setUpdate] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [product, setProduct] = useState({
        id: '',
        name: '',
        subtitle: '',
        price: ''
    });

    const handleBarcodeChange = (event) => {
        const value = event.target.value;

        setProduct({ ...product, id: value });
        setUpdate(false);

        if (value.length > 0) {
            axios.get(`${BASE_URL}/Product/${value}`)
                .then((response) => {
                    setProduct(response.data);
                    setUpdate(true);
                })
                .catch(() => {
                    if (update) {
                        setProduct({
                            ...product,
                            id: value,
                            name: '',
                            subtitle: '',
                            price: ''
                        });
                        setUpdate(false);
                    }
                });
        }

        setConfirmDelete(false);
    }

    const handleNameChange = (event) => {
        const value = event.target.value;

        setProduct({ ...product, name: value });
        setConfirmDelete(false);
    }

    const handleSubtitleChange = (event) => {
        const value = event.target.value;

        setProduct({ ...product, subtitle: value });
        setConfirmDelete(false);
    }

    const handlePriceChange = (event) => {
        const value = event.target.value;

        setProduct({ ...product, price: parseInt(value) });
        setConfirmDelete(false);
    }

    const getSaveButton = () => {
        if (update) {
            return (
                <button className="w-100 btn btn-outline-success" onClick={(event) => updateExisting(event) }>Update</button>
            );
        } else {
            return (
                <button className="w-100 btn btn-outline-primary" onClick={(event) => createNew(event) }>Create</button>
            );
        }
    }

    const createNew = async (event) => {
        event.preventDefault();

        await axios.post(`${BASE_URL}/Product`, product)
            .then(response => {
                toast.success('Product saved!');
                setProduct({
                    id: '',
                    name: '',
                    subtitle: '',
                    price: ''
                });
                setUpdate(false);
            })
            .catch(error => {
                toast.error('Unable to save product. Contact administrator.');
                console.log(error);
            });
    }

    const generateBarcode = () => {
        let result = '';
        const characters = '0123456789';
        const charLength = characters.length;

        for (let i = 0; i < 13; i++) {
            result += characters.charAt(Math.floor(Math.random() * charLength));
        }

        setProduct({
            ...product,
            id: result
        });
    }

    const updateExisting = async (event) => {
        event.preventDefault();

        await axios.patch(`${BASE_URL}/Product`, product)
            .then(response => {
                toast.success('Product updated!');
                setProduct({
                    id: '',
                    name: '',
                    subtitle: '',
                    price: ''
                });
                setUpdate(false);
            })
            .catch(error => {
                toast.error('Unable to update product. Contact administrator.');
                console.log(error);
            });
    }

    const handleClearClick = (event) => {
        if (confirmDelete) {
            setProduct({
                id: '',
                name: '',
                subtitle: '',
                price: ''
            });

            setConfirmDelete(false);
            setUpdate(false);
        } else {
            setConfirmDelete(true);
        }
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center p-5">
        <ToastContainer />
            <div className="main-div">
                <div className="input-group mb-3">
                    <div className="form-floating">
                        <input type="number" className="form-control" value={product.id} onChange={handleBarcodeChange} id="floatingInput" placeholder="name@example.com" /> 
                        <label htmlFor="floatingInput"><BsUpcScan></BsUpcScan></label>
                    </div>
                    <button className="btn btn-outline-primary" title="Generate a random barcode" onClick={() => generateBarcode() }>Generate Barcode</button>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" className="form-control" value={product.name} onChange={handleNameChange } id="floatingInput" placeholder="name@example.com" />
                    <label htmlFor="floatingInput">Name</label>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" className="form-control" value={product.subtitle} onChange={handleSubtitleChange } id="floatingInput" placeholder="name@example.com" />
                    <label htmlFor="floatingInput">Subtitle</label>
                </div>
                <div className="form-floating mb-3">
                    <input type="number" className="form-control" value={product.price} onChange={handlePriceChange } id="floatingInput" placeholder="name@example.com" />
                    <label htmlFor="floatingInput">Price (Php)</label>
                </div>
                <div className="d-flex flex-row">
                    {confirmDelete ? (
                        <button className="w-100 btn btn-danger me-1" onClick={(event) => handleClearClick(event)}>Click to confirm</button>
                    ) : (
                        <button className="w-100 btn btn-outline-danger me-1" onClick={(event) => handleClearClick(event)}>Clear</button>
                    )}
                    {getSaveButton() }
                </div>
            </div>
        </div>
    )
}

export default Register;