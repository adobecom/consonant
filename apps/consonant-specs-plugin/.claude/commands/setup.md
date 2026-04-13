# Set Up Consonant Tools Figma Plugin

You are helping a teammate set up the Consonant Tools Figma plugin on their machine. Walk them through each step, running commands for them when possible.

## Steps

### 1. Check prerequisites

Check that Node.js (v18+) is installed:
```bash
node --version
```

If not installed, tell the user to install it from https://nodejs.org and come back.

### 2. Clone the repo

Check if the repo already exists. If not, clone it to their Desktop:
```bash
cd ~/Desktop
git clone https://github.com/spicyxshrimp/consonant-figma-plugin.git
```

### 3. Install dependencies and build

```bash
cd ~/Desktop/consonant-figma-plugin
npm install
npm run build
```

### 4. Install the figma-console bridge

```bash
npm install -g figma-console-mcp
```

### 5. Tell the user what to do in Figma

After the commands finish, tell the user:

> **Almost done! Do these last two steps in Figma Desktop:**
>
> 1. Open Figma Desktop (not the browser version)
> 2. Go to **Plugins > Development > Import plugin from manifest...**
> 3. Navigate to `Desktop/consonant-figma-plugin` and select `manifest.json`
> 4. The plugin is now installed as **"Consonant Tools"**
>
> **To use AI-assisted features:**
> 1. Open the plugin in any Figma file
> 2. Go to the **Bridge** tab and click **Connect**
> 3. Then go to the **A11y** tab — the AI-assisted checkboxes will be enabled
>
> You're all set! Next time you want to use AI fill, just open Claude Code from the `consonant-figma-plugin` folder.
