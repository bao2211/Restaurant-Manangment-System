# Figma MCP Server Setup Guide

This guide explains how to install and configure the Figma MCP Write Server for opencode, allowing AI to create and edit designs directly in Figma.

## Prerequisites

- **Node.js 22.x** - Download from https://nodejs.org/
- **Figma Desktop** - Required for Plugin API access (browser version has limitations)
  - Download: https://www.figma.com/downloads/
- **opencode** - The AI coding agent
- **Git** - For cloning the repository

## Step 1: Clone the Figma MCP Write Server

```bash
git clone https://github.com/oO/figma-mcp-write-server.git
cd figma-mcp-write-server
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Build the Project

```bash
npm run build
```

If successful, you'll see:
```
✅ Build completed successfully!
```

## Step 4: Configure opencode

Add the following to your `opencode.json` file in your project root:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "figma-write": {
      "type": "local",
      "command": ["node", "/path/to/figma-mcp-write-server/dist/index.js"],
      "environment": {
        "NODE_ENV": "production"
      },
      "enabled": true
    }
  }
}
```

**Replace** `/path/to/figma-mcp-write-server/` with the actual path where you cloned the repository.

### Example (Windows):
```json
{
  "figma-write": {
    "type": "local",
    "command": ["node", "C:\\Users\\YourName\\figma-mcp-write-server\\dist\\index.js"],
    "environment": {
      "NODE_ENV": "production"
    },
    "enabled": true
  }
}
```

### Example (macOS/Linux):
```json
{
  "figma-write": {
    "type": "local",
    "command": ["node", "/home/yourname/figma-mcp-write-server/dist/index.js"],
    "environment": {
      "NODE_ENV": "production"
    },
    "enabled": true
  }
}
```

## Step 5: Install the Figma Plugin

1. Open **Figma Desktop**
2. Go to **Plugins → Development → Import plugin from manifest**
3. Navigate to the `figma-plugin` folder inside the cloned repository
4. Select `manifest.json`
5. Click **Open**

## Step 6: Run the Plugin

1. Open or create a Figma file
2. Go to **Plugins → Development → Figma MCP Write Server**
3. Click **Run**
4. You should see a plugin window with "Listening on port 8765"

## Step 7: Restart opencode

Exit and restart opencode to load the new MCP server configuration.

## Step 8: Test the Connection

Ask opencode to test the Figma connection:
```
Test the Figma MCP connection
```

If successful, you should see a ping response with the plugin version.

## Usage Examples

Once connected, you can ask opencode to:

### Create Basic Shapes
```
Create a blue rectangle at position 100, 100 with width 200 and height 100
```

### Create Text
```
Add a text node saying "Hello World" with font size 24
```

### Create Frames
```
Create a frame called "Login Screen" with width 375 and height 812
```

### Style Elements
```
Change the fill color of the rectangle to red
```

### Create Complete Screens
```
Create a mobile app login screen with:
- Purple header
- Username and password input fields
- Sign In button
- Register link
```

## Available Tools

The Figma MCP Write Server provides 24 tools:

### Core Design
- `figma_nodes` - Create/get/update/delete shapes and frames
- `figma_text` - Create and format text nodes
- `figma_fills` - Manage fill colors and gradients
- `figma_strokes` - Manage stroke properties
- `figma_effects` - Add shadows, blurs, and effects

### Layout & Positioning
- `figma_auto_layout` - Set up auto layout
- `figma_constraints` - Set layout constraints
- `figma_alignment` - Align and distribute elements
- `figma_hierarchy` - Group, ungroup, and reorder elements

### Design System
- `figma_styles` - Create and manage styles
- `figma_components` - Create component sets
- `figma_instances` - Manage component instances
- `figma_variables` - Create design tokens
- `figma_fonts` - Search and manage fonts

### Advanced Operations
- `figma_boolean_operations` - Union, subtract, intersect shapes
- `figma_vectors` - Create and edit vector paths

### Developer Tools
- `figma_dev_resources` - Generate CSS and dev specs
- `figma_annotations` - Add design annotations
- `figma_measurements` - Add spacing measurements
- `figma_exports` - Export designs as PNG/JPG/SVG

### System
- `figma_plugin_status` - Check plugin connection
- `figma_pages` - Manage pages
- `figma_selection` - Get/set selection
- `figma_images` - Manage images

## Troubleshooting

### "Port 8765 not listening"
- Make sure the Figma plugin is running in Figma Desktop
- Check that no other application is using port 8765

### "Connection refused"
- Restart the Figma plugin
- Restart opencode
- Verify the path in `opencode.json` is correct

### "Module not found"
- Run `npm install` again in the figma-mcp-write-server directory
- Make sure you're using Node.js 22.x

### "Plugin not showing in Figma"
- Make sure you're using Figma Desktop (not browser)
- Re-import the plugin from the manifest file

## Limitations

- Requires Figma Desktop (browser version has limited Plugin API access)
- Single file scope - operations limited to currently open file
- Network dependency - WebSocket connection required
- Active Figma session required for write operations

## Resources

- **Repository**: https://github.com/oO/figma-mcp-write-server
- **Documentation**: https://github.com/oO/figma-mcp-write-server/blob/main/docs/guide.md
- **Figma API**: https://www.figma.com/developers/api
