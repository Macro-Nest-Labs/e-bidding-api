
# Deploy Node.js App on Azure with Docker and HTTPS

This guide walks you through deploying a Node.js project with Express on Azure, utilizing Azure Container Instances (ACI) for deployment and ensuring HTTPS for secure frontend connections.

## **Step 1: Prepare Your Application**

### Review Your Dockerfile

- Ensure your Dockerfile is correctly set up for your Node.js application, including environment setup, application code copying, dependencies installation, and application start command.

### Test Locally

- Before deploying, it's crucial to test your Docker container locally to ensure everything runs as expected.

## **Step 2: Push Your Docker Image to Azure Container Registry (ACR)**

### Create an Azure Container Registry

1. **Log in to Azure CLI:**

   ```bash
   az login
   ```

2. **Create a Resource Group (if needed):**

   ```bash
   az group create --name myResourceGroup --location eastus
   ```

3. **Create the Registry:**

   ```bash
   az acr create --resource-group myResourceGroup --name <YourACRName> --sku Basic --admin-enabled true
   ```

### Push Your Docker Image

1. **Log in to ACR:**

   ```bash
   az acr login --name <YourACRName>
   ```

2. **Tag and Push Your Image:**

   ```bash
   docker tag <your-image>:<tag> <YourACRName>.azurecr.io/<your-image>:<tag>
   docker push <YourACRName>.azurecr.io/<your-image>:<tag>
   ```

## **Step 3: Deploy Your Container to Azure Container Instances**

### Create the Container Instance

- Deploy using the Azure CLI:

  ```bash
  az container create --resource-group myResourceGroup --name myContainer --image <YourACRName>.azurecr.io/<your-image>:<tag> --dns-name-label <your-dns-name-label> --ports 80 443
  ```

### Enable HTTPS

To serve your application over HTTPS, you'll need to configure TLS/SSL certificates. You can use:

- **Azure App Service Managed Certificates**: Secure your custom domain through the Azure portal.
- **Custom Domain & Certificate**: Use Azure Application Gateway or Azure Front Door for SSL termination.

## **Step 4: Verify Deployment**

- After deployment, access your application via the provided DNS name (e.g., `https://<your-dns-name-label>.azurecontainer.io`) to ensure it's accessible over HTTPS and functioning correctly.

## **Additional Notes**

- **Domain and SSL**: Purchase a domain through Azure or third-party providers if needed. Let's Encrypt offers free certificates suitable for many applications.
- **Monitoring and Management**: Use Azure Monitor and Log Analytics for performance and log monitoring.
