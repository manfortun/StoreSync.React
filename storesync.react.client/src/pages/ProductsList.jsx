import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './ProductsList.css'
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import { BsCopy } from 'react-icons/bs';
import { BASE_URL } from '../../utils/constants'; 
import Barcode from 'react-barcode';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [searchString, setSearchString] = useState('');

    useEffect(() => {
        axios.get(`${BASE_URL}/Product`)
            .then(response => {
                setProducts(response.data);
            });
    }, []);

    const applySearchString = () => {
        if (searchString.length <= 0) return products;

        return products.filter(p => {
            return (
                p.id.includes(searchString) ||
                p.name.toLowerCase().includes(searchString.toLowerCase()) ||
                p.subtitle.toLowerCase().includes(searchString.toLowerCase())
            );
        });
    }

    const setDigitFormat = (value) => {
        return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const copyToClipboard = (barcode) => {
        navigator.clipboard.writeText(barcode)
            .then(() => {
                toast.info('Barcode copied to clipboard.');
            })
            .catch((error) => {
                toast.error('Failed to copy code: ', error);
            });
    }

    return (
        <div className="p-4 d-flex flex-column mb-5 overflow-y-auto">
        <ToastContainer />
            <div>
                <h3 className="mb-3">Products List</h3>
                {products && (
                    <>
                        <div><input type="text" className="form-control mb-4 mt-4" placeholder="Search a name, subtitle, or barcode..." value={searchString} onChange={(event) => setSearchString(event.target.value) }></input></div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <td></td>
                                    <td className="d-lg-table-cell d-none">Barcode</td>
                                    <td>Name</td>
                                    <td>Subtitle</td>
                                    <td>Price (Php)</td>
                                </tr>
                            </thead>
                            <tbody>
                                {products && products.length > 0 && applySearchString().map(product => (
                                    <tr key={product.id}>
                                        <td><button className="btn btn-sm" title="Copy barcode" onClick={(event) => copyToClipboard(product.id) }><BsCopy /></button></td>
                                        <td className="d-lg-table-cell d-none"><Barcode value={product.id} width={1} height={15} displayValue={true} fontSize={10} /></td>
                                        <th>{product.name}</th>
                                        <td><small>{product.subtitle}</small></td>
                                        <td>{setDigitFormat(product.price)}</td>
                                    </tr>
                                )) }
                            </tbody>
                        </table>
                    </>
                ) }
            </div>
        </div>
    )
}

export default ProductsList;