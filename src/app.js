const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const pgRoutes = require("./routes/pg.routes");
const tenantRoutes = require("./routes/tenant.routes"); 
const billRoutes = require("./routes/bill.routes"); 
const paymentRoutes = require("./routes/payment.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

app.use(helmet());

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Livinkey Backend Running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/pgs", pgRoutes);
app.use("/api/tenants", tenantRoutes); 
app.use("/api/bills", billRoutes); 
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;