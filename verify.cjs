// Run: node verify.cjs. No dependencies. Exercises real handlers in a small DOM harness.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const events={},memory={},app={innerHTML:''},toast={textContent:'',classList:{add(){},remove(){}}};
const location={_hash:'#home',get hash(){return this._hash},set hash(value){this._hash=value.startsWith('#')?value:'#'+value}};
const c={console,Date,JSON,Math,String,Number,setTimeout(){},clearTimeout(){},location,
 localStorage:{getItem:k=>memory[k]??null,setItem:(k,v)=>memory[k]=v},
 window:{scrollY:0,scrollTo(){},addEventListener(name,fn){events['window:'+name]=fn}},
 document:{querySelector:s=>s==='#app'?app:s==='#toast'?toast:null,addEventListener(name,fn){(events[name]??=[]).push(fn)},title:''}};
vm.createContext(c);for(const file of ['app.js','journal.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
const run=s=>vm.runInContext(s,c),click=(dataset)=>{const b={dataset};for(const f of events.click||[])f({target:{closest(selector){return selector==='button[data-j]'?(dataset.j?b:null):b}}})};
function page(route){location.hash='#'+route;events['window:hashchange']();assert(!app.innerHTML.includes('undefined'),route);assert(!app.innerHTML.includes('NaN'),route);return app.innerHTML}
let checks=0;function check(value,label){assert(value,label);checks++}
check(app.innerHTML.includes('data-j="pet"'),'onboarding on first visit');
click({j:'pet',pet:'cat'});click({j:'pet',pet:'dog'});click({j:'save-pets'});
check(run('journal.prefs.pets.length')===2,'multi-pet choice');check(JSON.parse(memory['paw-prefs']).seen,'preference persisted');check(page('home').includes('pet-summary'),'homepage preference summary');
for(const route of ['home','product/1','standards','publish','messages','cart','profile','requests','orders','album','preferences','my-reviews','afters','review/missing','recycle-review/missing','after/missing'])check(page(route).length>500,'route '+route);
run("state.step=2; state.draft.route='灵活'");check(page('publish').includes('灵活处理'),'three destinations');check((app.innerHTML.match(/data-route=/g)||[]).length===3,'three choices only');
run("state.orders=[{id:'order',items:[{id:1,qty:1},{id:4,qty:1}],date:'test',total:108}];state.requests=[{id:'request',name:'Test cat bed',route:'灵活',date:'2026-12-01',method:'test',created:'test'}]");
check(!page('review/order~1').includes('data-j="submit-review"'),'cannot review before receipt');
page('orders');click({j:'receive',id:'order'});check(!run('state.orders[0].received'),'cannot receive before shipping');click({j:'ship',id:'order'});click({j:'receive',id:'order'});check(run('state.orders[0].received'),'ship and receive workflow');
page('review/order~1');click({j:'submit-review'});check(run('journal.reviews.length')===0,'two scores required');click({j:'rate',key:'product',value:'4'});click({j:'rate',key:'service',value:'2'});click({j:'rate',key:'clean',value:'1'});click({j:'review-tag',tag:'有异味'});run("getReviewDraft('order~1').text='<img onerror=alert(1)>';getReviewDraft('order~1').serviceText='test service'");click({j:'submit-review'});
check(run('journal.reviews.length')===1,'review saved');check(run('journal.reviews[0].product.score')===4&&run('journal.reviews[0].service.score')===2,'independent scores');check(location.hash==='#after/order','quality issue opens aftersales');check(!page('review/order~1').includes('data-j="submit-review"'),'duplicate review blocked');check(page('my-reviews').includes('&lt;img'),'review text escaped');
page('product/1');check(app.innerHTML.includes('同型号历史使用评价')&&app.innerHTML.includes('当前这一件'),'model review and current inspection separate');
page('progress/request');click({j:'advance',id:'request'});check(run('state.requests[0].stage')===1,'initial approval');click({j:'advance',id:'request'});check(run('state.requests[0].stage')===1,'flexible route requires decision');click({j:'decide',id:'request',routeValue:'回收'});for(let n=0;n<3;n++)click({j:'advance',id:'request'});check(run('state.requests[0].stage')===5,'recycle workflow completed');
page('recycle-review/request');click({j:'rate',key:'score',value:'5'});click({j:'rate',key:'settlement',value:'4'});click({j:'submit-recycle'});check(run('journal.feedbacks.length')===1,'recycle service feedback');check(run('journal.reviews.length')===1,'recycle not mixed with product reviews');
page('after/order');click({j:'submit-after'});check(run('journal.afters.length')===0,'aftersales description required');run("journal.afterDrafts.order.text='broken item needs help'");click({j:'submit-after'});check(run('journal.afters.length')===1,'aftersales created');const afterId=run('journal.afters[0].id');click({j:'advance-after',id:afterId});click({j:'advance-after',id:afterId});check(run('journal.afters[0].stage')===2,'aftersales lifecycle');
run("journal.prefs.pets=['dog'];state.category='全部';state.filter='全部';state.q=''");check(run('productCards().indexOf("product/5")<productCards().indexOf("product/1")'),'dog recommendations first');run("state.category='吃饭';state.filter='50元以内'");check(run('productCards()').includes('product/4')&&!run('productCards()').includes('product/1'),'category and price filters');
run("state.q='no such product'");check(!run('productCards()').includes('data-go='),'search empty state');
run("state.requests.push({id:'donation',name:'donation',route:'捐赠',stage:5,date:'test',created:'test',method:'test'})");check(!page('recycle-review/donation').includes('data-key="settlement"'),'donation has no settlement score');
click({j:'skip-pets'});check(run('journal.prefs.pets.length')===0&&run('journal.prefs.seen'),'skip/reset preferences');
console.log('PASS: '+checks+' workflow assertions, including receipt gating, separate reviews, flexible quote decision, aftersales, preferences, filters and escaping.');
