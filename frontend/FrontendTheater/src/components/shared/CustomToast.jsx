// src/components/shared/CustomToast.jsx
import React from 'react';
import { ToastContainer as ToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CustomToast.css';

const CustomToast = () => {
    return (
        <ToastifyContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            className="custom-toast-container"
        />
    );
};

export default CustomToast;