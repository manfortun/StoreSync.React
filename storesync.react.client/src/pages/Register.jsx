import React, {useState } from 'react'
import './Register.css'
import axios from 'axios'
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import { BsUpcScan } from 'react-icons/bs';

const Register = () => {
    const [update, setUpdate] = useState(false);
    const [product, setProduct] = useState({
        id: '',
        name: '',
        subtitle: '',
        price: 0
    });

    const handleBarcodeChange = (event) => {
        const value = event.target.value;

        setProduct({ ...product, id: value });
        setUpdate(false);
        axios.get('https://localhost:7170/API/Product/' + value)
            .then((response) => {
                setProduct(response.data);
                setUpdate(true);
            });
    }

    const handleNameChange = (event) => {
        const value = event.target.value;

        setProduct({ ...product, name: value });
    }

    const handleSubtitleChange = (event) => {
        const value = event.target.value;

        setProduct({ ...product, subtitle: value });
    }

    const handlePriceChange = (event) => {
        const value = event.target.value;

        setProduct({ ...product, price: parseInt(value) });
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

        await axios.post('https://localhost:7170/API/Product', product)
            .then(response => {
                toast.success('Product saved!');
                setProduct({
                    id: '',
                    name: '',
                    subtitle: '',
                    price: 0
                });
            })
            .catch(error => {
                toast.error('Unable to save product. Contact administrator.');
                console.log(error);
            });
    }

    const updateExisting = async (event) => {
        event.preventDefault();

        await axios.patch('https://localhost:7170/API/Product', product)
            .then(response => {
                toast.success('Product updated!');
                setProduct({
                    id: '',
                    name: '',
                    subtitle: '',
                    price: 0
                });
            })
            .catch(error => {
                toast.error('Unable to update product. Contact administrator.');
                console.log(error);
            });
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center p-5">
        <ToastContainer />
            <div className="main-div">
                <div className="form-floating mb-3">
                    <input type="number" className="form-control" value={product.id} onChange={handleBarcodeChange} id="floatingInput" placeholder="name@example.com" /> 
                    <label htmlFor="floatingInput"><BsUpcScan></BsUpcScan></label>
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
                    <button className="w-100 btn btn-outline-danger me-1">Clear</button>
                    {getSaveButton() }
                </div>
            </div>
        </div>
    )
}

export default Register;