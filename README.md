# Site Monitor | Check Website Status! 🚀  

✅ **Free to use!**
🌍 A powerful Node.js package to check **website availability** and send **iscord notifications**. Supports **scheduled** monitoring with custom intervals!

![NPM Version](https://img.shields.io/npm/v/website-status?color=blue&style=flat-square)  
![Downloads](https://img.shields.io/npm/dt/website-status?color=green&style=flat-square)  
![License](https://img.shields.io/npm/l/website-status?style=flat-square)  

---

## 📦 Installation  

### Install Globally for CLI Usage  
```sh
npm install -g website-status
```

### Install for Node.js Projects  
```sh
npm install website-status
```

---

## 🚀 Usage  

### 🔍 Check a Single Website Once  
```sh
site-checker https://utku.berkaykoc.net
```
📌 **Output:**  
✅ `https://utku.berkaykoc.net is UP!`  
or  
❌ `https://utku.berkaykoc.net is DOWN!`  

---

## 📢 **Optional Discord Webhook Notifications**  
If you want to receive a Discord notification when a site is down or up, provide a **Webhook URL**:  
```sh
site-checker https://utku.berkaykoc.net https://discord.com/api/webhooks/your-webhook-url
```
📌 **If no webhook is provided, it will only print the result in the terminal.**  

---

## 🔄 **Scheduled Monitoring (Interval & Loop Count)**  
You can set a monitoring interval and specify how many times to repeat the check.  

```sh
site-checker <URL> <Webhook (optional)> <Interval in seconds (optional)> <Loop count (optional)>
```

### **Rules:**  
- **If no interval or loop count is given, it runs only once.**  
- **Minimum interval is 30 seconds.**  
- **Maximum loop count is 50 times.**  

📌 **Examples:**  
```sh
# Check every 30 seconds, repeat 3 times
site-checker https://utku.berkaykoc.net null 30 3

# Check every 60 seconds, repeat 10 times
site-checker https://utku.berkaykoc.net null 60 10

# Check every 45 seconds, repeat 5 times, and send Discord notifications
site-checker https://utku.berkaykoc.net https://discord.com/api/webhooks/your-webhook-url 45 5

# If no interval or loopCount is given, it runs only once
site-checker https://utku.berkaykoc.net
```

---

## 📜 **Using in a Node.js Project**  

### Install the package  
```sh
npm install website-status
```

### Import the module  
```js
const { isSiteAvailable } = require("website-status");
```

### **Check if a site is up (without webhook)**  
```js
isSiteAvailable("https://example.com");
```

### **Check if a site is up (with webhook)**  
```js
isSiteAvailable("https://example.com", "https://discord.com/api/webhooks/your-webhook-url");
```

### **Check a site with custom interval & loop count**  
```js
isSiteAvailable("https://example.com", null, 60, 5); // Check every 60 seconds, 5 times
```

---


## 🛠️ Contributing  
Contributions are welcome! Fork the repository, create a branch, make changes, and submit a PR. 🚀  

---

## 📜 License  
This project is licensed under the **MIT License**.  

---

## 🌟 Support & Contact  
- **GitHub Issues:** [Report Bugs or Request Features](https://github.com/utkuberkaykoc/website-status/issues)  
- **Give a Star:** ⭐ If you like this package, consider giving it a star on GitHub!  

🚀 **Happy Coding!** 🎮✨  

