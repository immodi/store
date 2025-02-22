FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Upgrade npm
RUN npm install -g npm@9

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy your custom theme
COPY themes ./themes

# Copy the evershop directory into the container
COPY evershop ./evershop

# Copy your custom extensions
COPY extensions ./extensions

# Copy your config
COPY config ./config

# Copy your media
COPY media ./media

# Copy your public files
COPY public ./public

# Copy your translations
COPY translations ./translations

# Move files and check if each one was successful
RUN mv evershop/src/components/frontstore/checkout/checkout/payment/paymentStep/StepContent.jsx ./node_modules/@evershop/evershop/src/components/frontStore/checkout/checkout/payment/paymentStep/StepContent.jsx || { echo "Failed to move StepContent.jsx (paymentStep)"; exit 1; }
RUN mv evershop/src/components/frontstore/checkout/checkout/shipment/StepContent.jsx ./node_modules/@evershop/evershop/src/components/frontStore/checkout/checkout/shipment/StepContent.jsx || { echo "Failed to move StepContent.jsx (shipment)"; exit 1; }
RUN mv evershop/src/modules/paypal/pages/frontStore/checkout/Paypal.jsx ./node_modules/@evershop/evershop/src/modules/paypal/pages/frontStore/checkout/Paypal.jsx || { echo "Failed to move Paypal.jsx"; exit 1; }

# Print success message
RUN echo "All files moved successfully."

# Run the first npm command
RUN npm run user:create -- --email "mohsenabdma7@gmail.com" --password "Abd2005M@22" --name "Mohsen Abdalla"

# Run the second npm command
RUN npm run user:create -- --email "admin@admin.com" --password "modimodi" --name "Ahmed Yasser"

# Print command success
RUN echo "Commands executed successfully."

# Build assets
RUN npm run build

# Expose port 80
EXPOSE 80

# Start the application
CMD ["npm", "run", "start"]
