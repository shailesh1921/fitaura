const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/app/analytics.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

setTimeout(() => {
    const sidebar = dom.window.document.querySelector('.layout-sidebar');
    console.log("Sidebar innerHTML:", sidebar ? sidebar.innerHTML.substring(0, 200) : "No sidebar found");
}, 2000);
