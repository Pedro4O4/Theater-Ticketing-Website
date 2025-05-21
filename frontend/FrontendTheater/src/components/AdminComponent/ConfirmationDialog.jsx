import React from 'react';
import PropTypes from 'prop-types';
import './ConfirmationDialog.css'

const ConfirmationDialog = ({
                                isOpen,
                                title,
                                message,
                                confirmText,
                                cancelText,
                                onConfirm,
                                onCancel
                            }) => {
    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal confirmation-dialog">
                <h2>{title}</h2>
                <p className="dialog-message">{message}</p>
                <div className="button-container">
                    <button className="admin-button" onClick={onConfirm}>
                        {confirmText || 'Confirm'}
                    </button>
                    <button className="admin-button" onClick={onCancel}>
                        {cancelText || 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
};

ConfirmationDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

ConfirmationDialog.defaultProps = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
};

export default ConfirmationDialog;