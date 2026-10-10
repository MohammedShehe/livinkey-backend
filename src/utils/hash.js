const bcrypt = require("bcrypt");

async function run() {
    console.log("Super Admin:");
    console.log(await bcrypt.hash("super@123", 12));

    console.log("");

    console.log("Admin:");
    console.log(await bcrypt.hash("admin@123", 12));
}

run();