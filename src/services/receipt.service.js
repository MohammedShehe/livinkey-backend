const generatePaymentReceipt = (paymentData, type) => {
    const paymentDate = paymentData.payment_date || paymentData.created_at || new Date();
    const formattedDate = new Date(paymentDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const formattedTime = new Date(paymentDate).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const amount = type === 'proof' ? paymentData.amount_paid : paymentData.amount;
    const transactionId = type === 'proof' ? paymentData.transaction_id : paymentData.transaction_id || 'N/A';
    const paymentMethod = type === 'online' ? 'Online Payment' : 
                         type === 'cash' ? 'Cash Payment' : 
                         'Payment Proof';

    // Get status with proper formatting
    let status = paymentData.status || 'completed';
    if (type === 'proof') {
        status = paymentData.status === 'pending' ? 'Pending Verification' :
                 paymentData.status === 'verified' ? 'Verified' :
                 paymentData.status === 'rejected' ? 'Rejected' : status;
    }

    // Format bill breakdown
    const billBreakdown = `
        <tr>
            <td style="padding: 8px 0; color: #555;">Rent</td>
            <td style="padding: 8px 0; text-align: right; color: #333;">₹${parseFloat(paymentData.rent_amount || 0).toFixed(2)}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; color: #555;">Electricity Charges</td>
            <td style="padding: 8px 0; text-align: right; color: #333;">₹${parseFloat(paymentData.electricity_amount || 0).toFixed(2)}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; color: #555;">Maintenance Fee</td>
            <td style="padding: 8px 0; text-align: right; color: #333;">₹${parseFloat(paymentData.maintenance_amount || 0).toFixed(2)}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; color: #555;">Other Charges</td>
            <td style="padding: 8px 0; text-align: right; color: #333;">₹${parseFloat(paymentData.other_charges || 0).toFixed(2)}</td>
        </tr>
        ${parseFloat(paymentData.fine_amount || 0) > 0 ? `
        <tr>
            <td style="padding: 8px 0; color: #e74c3c;">Late Fee</td>
            <td style="padding: 8px 0; text-align: right; color: #e74c3c;">₹${parseFloat(paymentData.fine_amount).toFixed(2)}</td>
        </tr>` : ''}
        <tr>
            <td style="padding: 10px 0 0 0; border-top: 2px solid #e8ecf1; font-weight: 600; color: #333;">Total Bill</td>
            <td style="padding: 10px 0 0 0; border-top: 2px solid #e8ecf1; text-align: right; font-weight: 700; color: #92C24A;">₹${parseFloat(paymentData.bill_total || 0).toFixed(2)}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">Amount Paid</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #2ecc71;">₹${parseFloat(amount || 0).toFixed(2)}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; color: #555;">Payment Status</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${status === 'Verified' || status === 'completed' ? '#2ecc71' : status === 'Pending Verification' ? '#f39c12' : '#e74c3c'};">${status}</td>
        </tr>
    `;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: #f4f6f9;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .receipt-container {
                max-width: 800px;
                width: 100%;
                background: #ffffff;
                border-radius: 16px;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                overflow: hidden;
            }
            .receipt-header {
                background: #92C24A;
                padding: 30px 40px;
                color: #ffffff;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .receipt-header h1 {
                font-size: 24px;
                font-weight: 700;
                margin: 0;
            }
            .receipt-header .receipt-number {
                background: rgba(255, 255, 255, 0.15);
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
            }
            .receipt-body {
                padding: 40px;
            }
            .company-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e8ecf1;
            }
            .company-info .name {
                font-size: 20px;
                font-weight: 700;
                color: #333;
            }
            .company-info .details {
                color: #666;
                font-size: 14px;
                line-height: 1.6;
            }
            .customer-info {
                background: #f8faf5;
                border-radius: 8px;
                padding: 16px 20px;
                margin-bottom: 30px;
            }
            .customer-info h3 {
                font-size: 14px;
                font-weight: 600;
                color: #666;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .customer-info .row {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                font-size: 14px;
            }
            .customer-info .label {
                color: #666;
                font-weight: 500;
            }
            .customer-info .value {
                color: #333;
                font-weight: 600;
            }
            .bill-details {
                margin-bottom: 30px;
            }
            .bill-details h3 {
                font-size: 14px;
                font-weight: 600;
                color: #666;
                margin-bottom: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .bill-details table {
                width: 100%;
                border-collapse: collapse;
            }
            .bill-details table td {
                padding: 6px 0;
                font-size: 14px;
            }
            .payment-summary {
                background: #f8faf5;
                border-radius: 8px;
                padding: 16px 20px;
                margin-bottom: 30px;
            }
            .payment-summary .row {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                font-size: 14px;
            }
            .payment-summary .label {
                color: #666;
                font-weight: 500;
            }
            .payment-summary .value {
                color: #333;
                font-weight: 600;
            }
            .payment-summary .total {
                font-size: 18px;
                font-weight: 700;
                color: #92C24A;
                border-top: 2px solid #e8ecf1;
                padding-top: 12px;
                margin-top: 8px;
            }
            .receipt-footer {
                padding: 20px 40px;
                border-top: 1px solid #e8ecf1;
                background: #f8faf5;
                text-align: center;
                color: #888;
                font-size: 13px;
                line-height: 1.6;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            .status-completed {
                background: #d4edda;
                color: #155724;
            }
            .status-pending {
                background: #fff3cd;
                color: #856404;
            }
            .status-rejected {
                background: #f8d7da;
                color: #721c24;
            }
            .divider {
                border-top: 1px dashed #e8ecf1;
                margin: 16px 0;
            }
            @media (max-width: 600px) {
                .receipt-header {
                    flex-direction: column;
                    text-align: center;
                    gap: 10px;
                }
                .company-info {
                    flex-direction: column;
                    text-align: center;
                    gap: 10px;
                }
                .customer-info .row {
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }
                .receipt-body {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <!-- Header -->
            <div class="receipt-header">
                <h1>🧾 Payment Receipt</h1>
                <div class="receipt-number">
                    #${paymentData.id || 'N/A'}
                </div>
            </div>

            <!-- Body -->
            <div class="receipt-body">
                <!-- Company Info -->
                <div class="company-info">
                    <div>
                        <div class="name">Livinkey</div>
                        <div class="details">
                            PG Management System<br>
                            <span style="font-size: 12px;">Payment Receipt</span>
                        </div>
                    </div>
                    <div class="details" style="text-align: right;">
                        <strong>Date:</strong> ${formattedDate}<br>
                        <strong>Time:</strong> ${formattedTime}
                    </div>
                </div>

                <!-- Customer Info -->
                <div class="customer-info">
                    <h3>Customer Details</h3>
                    <div class="row">
                        <span class="label">Name</span>
                        <span class="value">${paymentData.tenant_name || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Email</span>
                        <span class="value">${paymentData.tenant_email || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Phone</span>
                        <span class="value">${paymentData.tenant_phone || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label">PG</span>
                        <span class="value">${paymentData.pg_name || 'N/A'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Room</span>
                        <span class="value">${paymentData.room_number || 'N/A'}</span>
                    </div>
                    ${paymentData.nationality ? `
                    <div class="row">
                        <span class="label">Nationality</span>
                        <span class="value">${paymentData.nationality}</span>
                    </div>` : ''}
                </div>

                <!-- Bill Details -->
                <div class="bill-details">
                    <h3>Bill Breakdown</h3>
                    <table>
                        ${billBreakdown}
                    </table>
                </div>

                <!-- Payment Summary -->
                <div class="payment-summary">
                    <h3 style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Payment Details</h3>
                    <div class="row">
                        <span class="label">Payment Method</span>
                        <span class="value">${paymentMethod}</span>
                    </div>
                    ${paymentData.payment_method ? `
                    <div class="row">
                        <span class="label">Payment Type</span>
                        <span class="value">${paymentData.payment_method}</span>
                    </div>` : ''}
                    <div class="row">
                        <span class="label">Transaction ID</span>
                        <span class="value">${transactionId}</span>
                    </div>
                    ${paymentData.verified_by_name ? `
                    <div class="row">
                        <span class="label">Verified By</span>
                        <span class="value">${paymentData.verified_by_name}</span>
                    </div>` : ''}
                    <div class="row total">
                        <span>Total Paid</span>
                        <span>₹${parseFloat(amount || 0).toFixed(2)}</span>
                    </div>
                </div>

                <!-- Bill Status -->
                <div style="text-align: center; margin-bottom: 10px;">
                    <span style="font-size: 14px; color: #666;">Bill Status: </span>
                    <span class="status-badge ${paymentData.bill_status === 'paid' ? 'status-completed' : 'status-pending'}">
                        ${paymentData.bill_status === 'paid' ? '✅ Paid' : paymentData.bill_status === 'partially_paid' ? '⚠️ Partially Paid' : '⏳ Unpaid'}
                    </span>
                </div>

                ${paymentData.notes ? `
                <div style="background: #f8faf5; border-radius: 8px; padding: 12px 16px; margin-top: 10px;">
                    <span style="font-size: 13px; color: #666; font-weight: 500;">Notes:</span>
                    <p style="font-size: 13px; color: #555; margin-top: 4px;">${paymentData.notes}</p>
                </div>` : ''}
            </div>

            <!-- Footer -->
            <div class="receipt-footer">
                <p>Thank you for your payment!</p>
                <p style="font-size: 12px; color: #aaa; margin-top: 4px;">
                    This is a system-generated receipt. For any queries, please contact support.
                </p>
                <p style="font-size: 11px; color: #ccc; margin-top: 4px;">
                    © 2022 Livinkey. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    generatePaymentReceipt
};