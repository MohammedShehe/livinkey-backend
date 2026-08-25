const maintenanceService = require("../services/maintenance.service");

// ============ TENANT MAINTENANCE ENDPOINTS ============

const createRequest = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const {
            issue_type,
            description,
            service_date,
            free_time
        } = req.body;

        // Validate required fields
        if (!issue_type) {
            return res.status(400).json({
                success: false,
                message: "Issue type is required"
            });
        }

        if (!service_date) {
            return res.status(400).json({
                success: false,
                message: "Service date is required"
            });
        }

        const validIssueTypes = ['Electrician', 'Plumber', 'Carpenter', 'RO', 'AC', 'WiFi', 'Cleaning', 'C-Form', 'Check-out', 'Others'];
        if (!validIssueTypes.includes(issue_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid issue type"
            });
        }

        const file = req.file || null;

        const request = await maintenanceService.createMaintenanceRequest(
            tenantId,
            {
                issue_type,
                description,
                service_date,
                free_time
            },
            file
        );

        return res.status(201).json({
            success: true,
            message: "Maintenance request submitted successfully",
            data: request
        });

    } catch (error) {
        console.error("Create Maintenance Request Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { status } = req.query;

        const requests = await maintenanceService.getTenantRequests(tenantId, status);

        return res.json({
            success: true,
            count: requests.length,
            data: requests
        });

    } catch (error) {
        console.error("Get My Requests Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getMyStats = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const stats = await maintenanceService.getTenantStats(tenantId);

        return res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Get My Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ============ ADMIN MAINTENANCE ENDPOINTS ============

const getAllRequestsAdmin = async (req, res) => {
    try {
        const { status, issue_type, pg_id, search } = req.query;

        const requests = await maintenanceService.getAllRequests({
            status,
            issue_type,
            pg_id,
            search
        });

        return res.json({
            success: true,
            count: requests.length,
            data: requests
        });

    } catch (error) {
        console.error("Get All Requests Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const { pg_id } = req.query;
        const stats = await maintenanceService.getAdminStats({ pg_id });

        return res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Get Admin Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getRequestByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await maintenanceService.getRequestById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Maintenance request not found"
            });
        }

        return res.json({
            success: true,
            data: request
        });

    } catch (error) {
        console.error("Get Request By ID Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const startRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await maintenanceService.updateRequestStatus(id, 'in_progress');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Maintenance request not found"
            });
        }

        return res.json({
            success: true,
            message: "Maintenance request started successfully",
            data: request
        });

    } catch (error) {
        console.error("Start Request Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const completeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        // Get the user who is completing - admin or tenant
        const completedBy = req.admin ? `admin_${req.admin.id}` : `tenant_${req.tenant.id}`;

        const request = await maintenanceService.updateRequestStatus(id, 'completed', completedBy);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Maintenance request not found"
            });
        }

        return res.json({
            success: true,
            message: "Maintenance request completed successfully",
            data: request
        });

    } catch (error) {
        console.error("Complete Request Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ============================================================
// NEW: Tenant completes a maintenance request
// ============================================================
const completeRequestByTenant = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { id } = req.params;

        const request = await maintenanceService.completeRequestByTenant(id, tenantId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Maintenance request not found"
            });
        }

        return res.json({
            success: true,
            message: "Maintenance request completed successfully",
            data: request
        });

    } catch (error) {
        console.error("Complete Request By Tenant Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ============================================================
// NEW: Check for in_progress requests older than 20 minutes
// and send push notifications to tenants
// ============================================================
const checkPendingCompletionReminders = async (req, res) => {
    try {
        const result = await maintenanceService.checkAndSendCompletionReminders();
        
        return res.status(200).json({
            success: true,
            message: `Sent ${result.sent} completion reminder(s)`,
            data: result
        });

    } catch (error) {
        console.error("Check Completion Reminders Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const deleteRequestAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await maintenanceService.deleteRequest(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Maintenance request not found"
            });
        }

        return res.json({
            success: true,
            message: "Maintenance request deleted successfully"
        });

    } catch (error) {
        console.error("Delete Request Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = {
    createRequest,
    getMyRequests,
    getMyStats,
    getAllRequestsAdmin,
    getAdminStats,
    getRequestByIdAdmin,
    startRequest,
    completeRequest,
    completeRequestByTenant,        // NEW
    checkPendingCompletionReminders, // NEW
    deleteRequestAdmin
};