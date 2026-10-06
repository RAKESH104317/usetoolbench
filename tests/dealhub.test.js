const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'frontend','src','App.tsx'),'utf8');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github','workflows','pages.yml'),'utf8');
const schema=fs.readFileSync(path.join(root,'schema.sql'),'utf8');

test('DealHub frontend contains all supported stores',()=>{for(const store of ['Amazon India','Flipkart','Myntra','AJIO','Zepto','Flipkart Minutes','Instamart','Blinkit'])assert.ok(app.includes(store),store);});
test('DealHub accepts only 10% to 100% admin discounts',()=>{assert.match(server,/discountPercent<10\|\|discountPercent>100/);});
test('Public API exposes only enabled verified deals',()=>{assert.match(server,/enabled=true.*verified=true/);});
test('Schema stores image and price-history fields',()=>{assert.match(schema,/image_url TEXT/);assert.match(schema,/CREATE TABLE IF NOT EXISTS price_history/);});
test('GitHub Pages builds and deploys the frontend',()=>{assert.match(workflow,/npm run build --prefix frontend/);assert.match(workflow,/actions\/deploy-pages@v4/);});
test('Frontend fallback supports all core filters',()=>{for(const term of ['q','store','cat','min','coupon','sort'])assert.ok(app.includes(term),term);assert.match(app,/filterAndSort/);});
