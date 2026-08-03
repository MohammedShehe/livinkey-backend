const tenantService = require("../services/tenant.service");
const { sendGuestMessageEmail } = require("../services/mail.service");

const createTenant = async (req, res) => {
    try {
        const {
            role,
            full_name,
            email,
            nationality,
            country_code,
            phone,
            gender,
            pg_id,
            room_id,
            residency,
            aadhaar_id,
            father_aadhaar_id,
            c_form_number,
            rent,
            security_fee,
            payment_date,
            paid_from,
            paid_till,
            arrival_date,
            number_of_tenants
        } = req.body;

        if (!role || !full_name || !email || !nationality || !country_code || !phone || !gender) {
            return res.status(400).json({
                success: false,
                message: "All basic fields are required: role, full_name, email, nationality, country_code, phone, gender"
            });
        }

        if (!['tenant', 'guest'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be either 'tenant' or 'guest'"
            });
        }

        if (role === 'tenant') {
            if (!pg_id || !room_id || !residency || !rent || !security_fee || !payment_date || !paid_from || !paid_till || !arrival_date) {
                return res.status(400).json({
                    success: false,
                    message: "All tenant-specific fields are required: pg_id, room_id, residency, rent, security_fee, payment_date, paid_from, paid_till, arrival_date"
                });
            }

            if (!['national', 'international'].includes(residency)) {
                return res.status(400).json({
                    success: false,
                    message: "Residency must be either 'national' or 'international'"
                });
            }

            if (residency === 'national') {
                if (!aadhaar_id || !father_aadhaar_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Aadhaar ID and Father Aadhaar ID are required for national tenants"
                    });
                }
            }
        }

        const tenantData = {
            role,
            full_name,
            email,
            nationality,
            country_code,
            phone,
            gender,
            created_by: req.admin.id
        };

        if (role === 'tenant') {
            tenantData.pg_id = parseInt(pg_id);
            tenantData.room_id = parseInt(room_id);
            tenantData.residency = residency;
            tenantData.aadhaar_id = aadhaar_id || null;
            tenantData.father_aadhaar_id = father_aadhaar_id || null;
            tenantData.c_form_number = c_form_number || null;
            tenantData.rent = parseFloat(rent);
            tenantData.security_fee = parseFloat(security_fee);
            tenantData.payment_date = parseInt(payment_date);
            tenantData.paid_from = paid_from;
            tenantData.paid_till = paid_till;
            tenantData.arrival_date = arrival_date;
            const parsedCount = parseInt(number_of_tenants);
            tenantData.number_of_tenants = (isNaN(parsedCount) || parsedCount <= 0) ? 1 : parsedCount;
        }

        const files = {
            document: req.files?.document || [],
            otherDocuments: req.files?.otherDocuments || []
        };

        const tenant = await tenantService.createTenant(tenantData, files);

        return res.status(201).json({
            success: true,
            message: `${role} created successfully`,
            data: tenant
        });

    } catch (error) {
        console.error("Create Tenant Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const getAllTenants = async (req, res) => {
    try {
        const { search, role, gender, bill_status } = req.query;
        const tenants = await tenantService.getAllTenants(search, role, gender, bill_status);

        return res.status(200).json({
            success: true,
            count: tenants.length,
            data: tenants
        });

    } catch (error) {
        console.error("Get All Tenants Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getTenantStats = async (req, res) => {
    try {
        const stats = await tenantService.getTenantStats();

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Get Tenant Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getGuestStats = async (req, res) => {
    try {
        const stats = await tenantService.getGuestStats();

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Get Guest Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getTenantById = async (req, res) => {
    try {
        const { id } = req.params;
        const tenant = await tenantService.getTenantById(id);

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: tenant
        });

    } catch (error) {
        console.error("Get Tenant By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            role,
            full_name,
            email,
            nationality,
            country_code,
            phone,
            gender,
            pg_id,
            room_id,
            residency,
            aadhaar_id,
            father_aadhaar_id,
            c_form_number,
            rent,
            security_fee,
            payment_date,
            paid_from,
            paid_till,
            arrival_date,
            number_of_tenants
        } = req.body;

        if (!role || !full_name || !email || !nationality || !country_code || !phone || !gender) {
            return res.status(400).json({
                success: false,
                message: "All basic fields are required: role, full_name, email, nationality, country_code, phone, gender"
            });
        }

        if (!['tenant', 'guest'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be either 'tenant' or 'guest'"
            });
        }

        if (role === 'tenant') {
            if (!pg_id || !room_id || !residency || !rent || !security_fee || !payment_date || !paid_from || !paid_till || !arrival_date) {
                return res.status(400).json({
                    success: false,
                    message: "All tenant-specific fields are required: pg_id, room_id, residency, rent, security_fee, payment_date, paid_from, paid_till, arrival_date"
                });
            }

            if (!['national', 'international'].includes(residency)) {
                return res.status(400).json({
                    success: false,
                    message: "Residency must be either 'national' or 'international'"
                });
            }

            if (residency === 'national') {
                if (!aadhaar_id || !father_aadhaar_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Aadhaar ID and Father Aadhaar ID are required for national tenants"
                    });
                }
            }
        }

        const tenantData = {
            role,
            full_name,
            email,
            nationality,
            country_code,
            phone,
            gender
        };

        if (role === 'tenant') {
            tenantData.pg_id = parseInt(pg_id);
            tenantData.room_id = parseInt(room_id);
            tenantData.residency = residency;
            tenantData.aadhaar_id = aadhaar_id || null;
            tenantData.father_aadhaar_id = father_aadhaar_id || null;
            tenantData.c_form_number = c_form_number || null;
            tenantData.rent = parseFloat(rent);
            tenantData.security_fee = parseFloat(security_fee);
            tenantData.payment_date = parseInt(payment_date);
            tenantData.paid_from = paid_from;
            tenantData.paid_till = paid_till;
            tenantData.arrival_date = arrival_date;
            const parsedCount = parseInt(number_of_tenants);
            tenantData.number_of_tenants = (isNaN(parsedCount) || parsedCount <= 0) ? 1 : parsedCount;
        }

        const files = {
            document: req.files?.document || [],
            otherDocuments: req.files?.otherDocuments || []
        };

        const tenant = await tenantService.updateTenant(id, tenantData, files);

        return res.status(200).json({
            success: true,
            message: `${role} updated successfully`,
            data: tenant
        });

    } catch (error) {
        console.error("Update Tenant Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const deleteTenant = async (req, res) => {
    try {
        const { id } = req.params;
        await tenantService.deleteTenant(id);

        return res.status(200).json({
            success: true,
            message: "Tenant deleted successfully"
        });

    } catch (error) {
        console.error("Delete Tenant Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, subject } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message content is required"
            });
        }

        const tenant = await tenantService.getTenantById(id);
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found"
            });
        }

        if (tenant.role !== 'guest') {
            return res.status(400).json({
                success: false,
                message: "Messages can only be sent to guests"
            });
        }

        const adminName = req.admin.name || 'Livinkey Admin';

        await sendGuestMessageEmail(
            tenant.email,
            tenant.full_name,
            adminName,
            message,
            subject || null
        );

        return res.status(200).json({
            success: true,
            message: "Message sent successfully to guest"
        });

    } catch (error) {
        console.error("Send Message Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = {
    createTenant,
    getAllTenants,
    getTenantStats,
    getGuestStats,
    getTenantById,
    updateTenant,
    deleteTenant,
    sendMessage
};