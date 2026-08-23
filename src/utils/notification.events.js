const NotificationService = require("../services/notification.service");
const db = require("../config/db");
const { generateNotificationMessages } = NotificationService;
const tenantNotificationService = require("../services/tenant.notification.service");
const guestNotificationService = require("../services/guest.notification.service");

/**
 * Event handlers for various actions that trigger notifications
 */
class NotificationEventManager {
    
    /**
     * Check and send e-FRRO expiry notifications
     * This should be called by a cron job
     */
    static async checkEFRROExpiry() {
        try {
            const connection = await db.getConnection();
            
            // Get tenants with e-FRRO expiring in 7, 14, or 30 days
            const [tenants] = await connection.execute(
                `
                SELECT 
                    t.id,
                    t.full_name,
                    t.email,
                    td.efrro_till,
                    DATEDIFF(td.efrro_till, CURDATE()) as days_until_expiry
                FROM tenants t
                JOIN tenant_details td ON t.id = td.tenant_id
                WHERE 
                    t.role = 'tenant'
                    AND td.residency = 'international'
                    AND td.efrro_till IS NOT NULL
                    AND td.efrro_till != ''
                    AND td.efrro_till > CURDATE()
                    AND DATEDIFF(td.efrro_till, CURDATE()) IN (7, 14, 30)
                `
            );
            connection.release();

            for (const tenant of tenants) {
                const messageData = generateNotificationMessages.tenantEFRROExpiry(
                    tenant,
                    tenant.days_until_expiry
                );

                await NotificationService.sendNotificationToAllAdmins(
                    'TENANT_EFRRO_EXPIRY',
                    {
                        ...messageData,
                        entity_id: tenant.id,
                        entity_type: 'tenant',
                        link: `/tenants/${tenant.id}`
                    }
                );
            }

            return tenants.length;
        } catch (error) {
            console.error('Error checking e-FRRO expiry:', error);
            return 0;
        }
    }

    /**
     * Check and send overdue payment notifications
     * This should be called by a cron job
     */
    static async checkOverduePayments() {
        try {
            const connection = await db.getConnection();
            
            // Get tenants with overdue payments at 7, 14, 21 days
            const [tenants] = await connection.execute(
                `
                SELECT 
                    t.id,
                    t.full_name,
                    t.email,
                    td.paid_till,
                    DATEDIFF(CURDATE(), td.paid_till) as days_overdue
                FROM tenants t
                JOIN tenant_details td ON t.id = td.tenant_id
                WHERE 
                    t.role = 'tenant'
                    AND td.paid_till < CURDATE()
                    AND DATEDIFF(CURDATE(), td.paid_till) IN (7, 14, 21, 30)
                `
            );
            connection.release();

            for (const tenant of tenants) {
                const messageData = generateNotificationMessages.tenantPaymentDue(
                    tenant,
                    tenant.days_overdue
                );

                await NotificationService.sendNotificationToAllAdmins(
                    'TENANT_EXPIRY',
                    {
                        ...messageData,
                        entity_id: tenant.id,
                        entity_type: 'tenant',
                        link: `/tenants/${tenant.id}`
                    }
                );
            }

            return tenants.length;
        } catch (error) {
            console.error('Error checking overdue payments:', error);
            return 0;
        }
    }

    /**
     * Handle tenant creation event
     */
    static async onTenantCreated(tenant) {
        const messageData = generateNotificationMessages.tenantRegistered(tenant);
        
        await NotificationService.sendNotificationToAllAdmins(
            'TENANT_REGISTERED',
            {
                ...messageData,
                link: `/tenants/${tenant.id}`
            }
        );
    }

    /**
     * Handle guest creation event
     */
    static async onGuestCreated(guest) {
        const messageData = generateNotificationMessages.guestRegistered(guest);
        
        await NotificationService.sendNotificationToAllAdmins(
            'GUEST_REGISTERED',
            {
                ...messageData,
                link: `/tenants/${guest.id}`
            }
        );
    }

    /**
     * Handle bill creation event
     */
    static async onBillCreated(bill, tenant) {
        const messageData = generateNotificationMessages.billCreated(bill, tenant);
        
        await NotificationService.sendNotificationToAllAdmins(
            'BILL_CREATED',
            {
                ...messageData,
                link: `/bills/${bill.id}`
            }
        );
    }

    /**
     * Handle bill payment event
     */
    static async onBillPaid(bill, tenant) {
        const messageData = generateNotificationMessages.billPaid(bill, tenant);
        
        await NotificationService.sendNotificationToAllAdmins(
            'BILL_PAID',
            {
                ...messageData,
                link: `/bills/${bill.id}`
            }
        );
    }

    /**
     * Handle partial bill payment event
     */
    static async onBillPartiallyPaid(bill, tenant) {
        const messageData = generateNotificationMessages.billPartiallyPaid(bill, tenant);
        
        await NotificationService.sendNotificationToAllAdmins(
            'BILL_PARTIALLY_PAID',
            {
                ...messageData,
                link: `/bills/${bill.id}`
            }
        );
    }

    /**
     * Handle fine applied event
     */
    static async onFineApplied(bill, tenant, fineAmount) {
        const messageData = generateNotificationMessages.fineApplied(bill, tenant, fineAmount);
        
        await NotificationService.sendNotificationToAllAdmins(
            'BILL_FINE_APPLIED',
            {
                ...messageData,
                link: `/bills/${bill.id}`
            }
        );
    }

    /**
     * Handle cash payment verification event
     */
    static async onCashPaymentVerified(bill, tenant) {
        const messageData = generateNotificationMessages.cashPaymentVerified(bill, tenant);
        
        await NotificationService.sendNotificationToAllAdmins(
            'CASH_PAYMENT_VERIFIED',
            {
                ...messageData,
                link: `/bills/${bill.id}`
            }
        );
    }

    /**
     * Handle PG creation event
     */
    static async onPGCreated(pg) {
        const messageData = generateNotificationMessages.pgCreated(pg);
        
        await NotificationService.sendNotificationToAllAdmins(
            'PG_CREATED',
            {
                ...messageData,
                link: `/pgs/${pg.id}`
            }
        );
    }

    /**
     * Handle PG update event
     */
    static async onPGUpdated(pg) {
        const messageData = generateNotificationMessages.pgUpdated(pg);
        
        await NotificationService.sendNotificationToAllAdmins(
            'PG_UPDATED',
            {
                ...messageData,
                link: `/pgs/${pg.id}`
            }
        );
    }

    /**
     * Handle PG status change event
     */
    static async onPGStatusChanged(pg, status) {
        const type = status ? 'PG_ACTIVATED' : 'PG_DEACTIVATED';
        const messageData = status 
            ? generateNotificationMessages.pgActivated(pg)
            : generateNotificationMessages.pgDeactivated(pg);
        
        await NotificationService.sendNotificationToAllAdmins(
            type,
            {
                ...messageData,
                link: `/pgs/${pg.id}`
            }
        );
    }

    /**
     * Handle admin creation event
     */
    static async onAdminCreated(admin, createdBy) {
        const messageData = generateNotificationMessages.adminCreated(admin);
        
        // Send to super admins only
        await NotificationService.sendNotificationToSuperAdmins(
            'ADMIN_CREATED',
            {
                ...messageData,
                link: `/admins/${admin.id}`
            }
        );
    }

    /**
     * Handle feedback submission event
     */
    static async onFeedbackSubmitted(feedback) {
        const messageData = generateNotificationMessages.feedbackSubmitted(feedback);
        
        await NotificationService.sendNotificationToAllAdmins(
            'FEEDBACK_SUBMITTED',
            {
                ...messageData,
                entity_id: feedback.id,
                entity_type: 'feedback',
                link: `/feedbacks/${feedback.id}`
            }
        );
    }

    /**
     * Handle maintenance request creation event (NEW)
     */
    static async onMaintenanceCreated(request) {
        const messageData = generateNotificationMessages.maintenanceCreated(request);
        
        await NotificationService.sendNotificationToAllAdmins(
            'MAINTENANCE_CREATED',
            {
                ...messageData,
                entity_id: request.id,
                entity_type: 'maintenance',
                link: `/maintenance/${request.id}`
            }
        );
    }

    /**
     * Handle maintenance status update event (NEW)
     */
    static async onMaintenanceStatusUpdated(request) {
        const messageData = generateNotificationMessages.maintenanceUpdated(request);
        
        await NotificationService.sendNotificationToAllAdmins(
            'MAINTENANCE_UPDATED',
            {
                ...messageData,
                entity_id: request.id,
                entity_type: 'maintenance',
                link: `/maintenance/${request.id}`
            }
        );
    }

    /**
     * Send notification to tenant when bill is created
     */
    static async onTenantBillCreated(bill, tenant) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.billCreated(bill);
        
        await tenantNotificationService.sendTenantNotification(
            tenant.id,
            'BILL_CREATED',
            {
                ...messageData,
                link: `/tenant-payments/bill`
            }
        );
    }

    /**
     * Send notification to tenant when bill is paid
     */
    static async onTenantBillPaid(bill, tenant) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.billPaid(bill);
        
        await tenantNotificationService.sendTenantNotification(
            tenant.id,
            'BILL_PAID',
            {
                ...messageData,
                link: `/tenant-payments/history`
            }
        );
    }

    /**
     * Send notification to tenant when partial payment is made
     */
    static async onTenantBillPartiallyPaid(bill, tenant) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.billPartiallyPaid(bill);
        
        await tenantNotificationService.sendTenantNotification(
            tenant.id,
            'BILL_PARTIALLY_PAID',
            {
                ...messageData,
                link: `/tenant-payments/history`
            }
        );
    }

    /**
     * Send notification to tenant when maintenance is created
     */
    static async onTenantMaintenanceCreated(request) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.maintenanceCreated(request);
        
        await tenantNotificationService.sendTenantNotification(
            request.tenant_id,
            'MAINTENANCE_CREATED',
            {
                ...messageData,
                link: `/maintenance/my-requests`
            }
        );
    }

    /**
     * Send notification to tenant when maintenance is started
     */
    static async onTenantMaintenanceStarted(request) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.maintenanceStarted(request);
        
        await tenantNotificationService.sendTenantNotification(
            request.tenant_id,
            'MAINTENANCE_STARTED',
            {
                ...messageData,
                link: `/maintenance/my-requests`
            }
        );
    }

    /**
     * Send notification to tenant when maintenance is completed
     */
    static async onTenantMaintenanceCompleted(request) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.maintenanceCompleted(request);
        
        await tenantNotificationService.sendTenantNotification(
            request.tenant_id,
            'MAINTENANCE_COMPLETED',
            {
                ...messageData,
                link: `/maintenance/my-requests`
            }
        );
    }

    /**
     * Send notification to guests when a new PG is added
     */
    static async onGuestPGAdded(pg) {
        try {
            // Get all active guests
            const connection = await db.getConnection();
            const [guests] = await connection.execute(
                `SELECT id FROM tenants WHERE role = 'guest' AND is_active = 1`
            );
            connection.release();

            if (guests.length === 0) return;

            const guestIds = guests.map(guest => guest.id);
            const messageData = guestNotificationService.generateGuestNotificationMessages.pgAdded(pg);
            
            await guestNotificationService.sendNotificationsToGuests(
                guestIds,
                'PG_ADDED',
                {
                    ...messageData,
                    link: `/public/pgs/${pg.id}`
                }
            );
        } catch (error) {
            console.error('Error sending PG added notification to guests:', error);
        }
    }

    /**
     * Send notification to guests when a room becomes vacant
     */
    static async onGuestRoomVacant(room, pgName) {
        try {
            const connection = await db.getConnection();
            const [guests] = await connection.execute(
                `SELECT id FROM tenants WHERE role = 'guest' AND is_active = 1`
            );
            connection.release();

            if (guests.length === 0) return;

            const guestIds = guests.map(guest => guest.id);
            const roomData = { ...room, pg_name: pgName };
            const messageData = guestNotificationService.generateGuestNotificationMessages.vacantRoom(roomData);
            
            await guestNotificationService.sendNotificationsToGuests(
                guestIds,
                'VACANT_ROOM',
                {
                    ...messageData,
                    link: `/public/pgs/${room.pg_id}`
                }
            );
        } catch (error) {
            console.error('Error sending vacant room notification to guests:', error);
        }
    }


    /**
     * Send notification to tenant when bill fine is applied
     */
    static async onTenantBillFineApplied(bill, fineAmount) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.billFineApplied(bill, fineAmount);
        
        await tenantNotificationService.sendTenantNotification(
            bill.tenant_id,
            'BILL_FINE_APPLIED',
            {
                ...messageData,
                link: `/tenant-payments/bill`
            }
        );
    }

    /**
     * Send notification to guests when PG is updated
     */
    static async onGuestPGUpdated(pg) {
        try {
            const connection = await db.getConnection();
            const [guests] = await connection.execute(
                `SELECT id FROM tenants WHERE role = 'guest' AND is_active = 1`
            );
            connection.release();

            if (guests.length === 0) return;

            const guestIds = guests.map(guest => guest.id);
            const messageData = guestNotificationService.generateGuestNotificationMessages.pgUpdated(pg);
            
            await guestNotificationService.sendNotificationsToGuests(
                guestIds,
                'PG_UPDATED',
                {
                    ...messageData,
                    link: `/public/pgs/${pg.id}`
                }
            );
        } catch (error) {
            console.error('Error sending PG updated notification to guests:', error);
        }
    }

    // ============================================================
    // NEW: Document reminder notification to tenant
    // ============================================================
    static async onTenantDocumentReminder(tenant, docLabel) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.documentReminder(docLabel);

        await tenantNotificationService.sendTenantNotification(
            tenant.id,
            'DOCUMENT_REMINDER',
            {
                ...messageData,
                link: `/documents`
            }
        );
    }

    // ============================================================
    // NEW: e-FRRO expiry notification to tenant (in-app)
    // ============================================================
    static async onTenantEFRROExpiry(tenant, daysUntilExpiry) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.efrroExpiry(daysUntilExpiry);

        await tenantNotificationService.sendTenantNotification(
            tenant.id,
            'EFRRO_EXPIRY',
            {
                ...messageData,
                link: `/documents`
            }
        );
    }

    // ============================================================
    // NEW: Payment (rent due) reminder notification to tenant
    // ============================================================
    static async onTenantPaymentReminder(tenant, daysLeft) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.paymentReminder(daysLeft);

        await tenantNotificationService.sendTenantNotification(
            tenant.id,
            'PAYMENT_REMINDER',
            {
                ...messageData,
                link: `/tenant-payments/bill`
            }
        );
    }

    // ============================================================
    // NEW: Bill overdue notification to tenant
    // ============================================================
    static async onTenantBillOverdue(bill, tenant, daysOverdue) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.billOverdue(bill, daysOverdue);

        await tenantNotificationService.sendTenantNotification(
            tenant.id,
            'BILL_OVERDUE',
            {
                ...messageData,
                link: `/tenant-payments/bill`
            }
        );
    }

    // ============================================================
    // NEW: Feedback submission confirmation to tenant
    // ============================================================
    static async onTenantFeedbackSubmitted(tenantId) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.feedbackSubmitted();

        await tenantNotificationService.sendTenantNotification(
            tenantId,
            'FEEDBACK_SUBMITTED',
            {
                ...messageData,
                link: `/profile`
            }
        );
    }

    // ============================================================
    // FIXED: Notify admins when a tenant submits a payment proof
    // ============================================================
    static async onPaymentProofSubmitted(proof) {
        const messageData = generateNotificationMessages.paymentProofSubmitted(proof);

        await NotificationService.sendNotificationToAllAdmins(
            'PAYMENT_PROOF_SUBMITTED',
            {
                ...messageData,
                link: `/bills/payment-proofs/${proof.id}`
            }
        );
    }

    // ============================================================
    // FIXED: Notify tenant when their payment proof is verified
    // ============================================================
    static async onTenantPaymentProofVerified(bill, tenant) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.paymentProofVerified(bill);

        await tenantNotificationService.sendTenantNotification(
            tenant.id,
            'PAYMENT_PROOF_VERIFIED',
            {
                ...messageData,
                link: `/tenant-payments/history`
            }
        );
    }

    // ============================================================
    // FIXED: Notify tenant when their payment proof is rejected
    // ============================================================
    static async onTenantPaymentProofRejected(tenantId, reason) {
        const messageData = tenantNotificationService.generateTenantNotificationMessages.paymentProofRejected(reason);

        await tenantNotificationService.sendTenantNotification(
            tenantId,
            'PAYMENT_PROOF_REJECTED',
            {
                ...messageData,
                link: `/tenant-payments/history`
            }
        );
    }
}

module.exports = NotificationEventManager;