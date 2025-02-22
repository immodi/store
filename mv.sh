#!/bin/bash

# Move files and check if each one was successful
mv evershop/src/components/frontstore/checkout/checkout/payment/paymentStep/StepContent.jsx ./node_modules/@evershop/evershop/src/components/frontStore/checkout/checkout/payment/paymentStep/StepContent.jsx || { echo "Failed to move StepContent.jsx (paymentStep)"; exit 1; }

mv evershop/src/components/frontstore/checkout/checkout/shipment/StepContent.jsx ./node_modules/@evershop/evershop/src/components/frontStore/checkout/checkout/shipment/StepContent.jsx || { echo "Failed to move StepContent.jsx (shipment)"; exit 1; }

mv evershop/src/modules/paypal/pages/frontStore/checkout/Paypal.jsx ./node_modules/@evershop/evershop/src/modules/paypal/pages/frontStore/checkout/Paypal.jsx || { echo "Failed to move Paypal.jsx"; exit 1; }

echo "All files moved successfully."

# Run the first npm command
npm run user:create -- --email "mohsenabdma7@gmail.com" --password "Abd2005M@22" --name "Mohsen Abdalla"

# Run the second npm command
npm run user:create -- --email "admin@admin.com" --password "modimodi" --name "Ahmed Yasser"

echo "Commands executed successfully."
