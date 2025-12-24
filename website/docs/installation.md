---
sidebar_position: 2
---

# Installation

This guide will help you install the n8n-nodes-ethereum package in your n8n instance.

## Method 1: Install via n8n Community Nodes (Recommended)

This is the easiest way to install the package if you're using n8n with a GUI.

### Steps:

1. **Open n8n Settings**
   - Go to **Settings** → **Community Nodes**

2. **Install the Package**
   - Click on **Install a community node**
   - Enter the package name: `@0xlimao/n8n-nodes-ethereum`
   - Click **Install**

3. **Restart n8n** (if required)
   - Some n8n installations may require a restart after installing community nodes
   - Follow the prompts if a restart is needed

4. **Verify Installation**
   - Create a new workflow
   - Add a new node and search for "Ethereum"
   - You should see two nodes:
     - **Ethereum** (regular node)
     - **Ethereum Trigger** (trigger node)

## Method 2: Manual Installation

If you're running n8n from source or need to install manually, follow these steps.

### For npm installations:

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install @0xlimao/n8n-nodes-ethereum

# Restart n8n
```

### For Docker installations:

Add the package to your Docker setup by modifying your `docker-compose.yml`:

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_COMMUNITY_PACKAGES=@0xlimao/n8n-nodes-ethereum
    ports:
      - 5678:5678
    volumes:
      - ~/.n8n:/home/node/.n8n
```

Then restart your Docker container:

```bash
docker-compose down
docker-compose up -d
```

### For n8n Cloud:

n8n Cloud users can install community nodes directly from the n8n interface using Method 1 above.

## Verification

After installation, verify that the package is working:

1. Create a new workflow
2. Add an **Ethereum** node
3. You should see the following resources available:
   - Account
   - Block
   - Transaction
   - Contract
   - ERC20
   - ERC721
   - ERC1155
   - ENS
   - Gas
   - Signature
   - Utils

## Troubleshooting

### Node not appearing after installation

- **Restart n8n**: Sometimes n8n needs to be restarted for new nodes to appear
- **Check logs**: Look at n8n logs for any error messages during package installation
- **Verify package name**: Ensure you used the correct package name `@0xlimao/n8n-nodes-ethereum`

### Installation fails

- **Check npm version**: Ensure you have npm 7.0 or higher
- **Check Node.js version**: Ensure you have Node.js 18.0 or higher
- **Permissions**: Make sure you have write permissions to the n8n directory

### Docker installation issues

- **Volume permissions**: Ensure the mounted volume has correct permissions
- **Restart container**: Try stopping and starting the container after modifying docker-compose.yml
- **Check environment variable**: Verify the `N8N_COMMUNITY_PACKAGES` environment variable is set correctly

## Next Steps

After successful installation, proceed to [configure credentials](./credentials.md) to start using the Ethereum nodes.
