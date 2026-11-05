const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const window={};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../s43-cases.js'),'utf8'),{window});const data=window.Slop43Cases;
assert.equal(data.cases.length,44);assert.equal(data.groups.length,11);
const byPage=new Set(data.cases.map(x=>x.page));assert.equal(byPage.size,44);
assert.equal(data.groups.flatMap(g=>g.pages).length,44);
assert.equal(new Set(data.groups.flatMap(g=>g.pages)).size,44);
for(const g of data.groups){assert.equal(g.pages.length,4);for(const page of g.pages)assert.ok(byPage.has(page),page)}
for(const c of data.cases){assert.equal(c.choices.length,3,c.page);assert.equal(c.answers.length,3,c.page);assert.equal(typeof c.insight,'string');assert.equal(typeof c.clue,'string');assert.ok(c.insight.length>18,c.page);assert.ok(c.question.includes('?'),c.page);assert.equal(c.correct,0);assert.ok(c.group,c.page);}
assert.match(fs.readFileSync(require('node:path').join(__dirname,'../s43-play.js'),'utf8'),/X\.exclusive/);
assert.ok(data.cases.some(c=>c.page==='slopnews.html'));
console.log('PASS 44 authored interactive micro-missions; 11 dossiers; three choices and three evidence responses per mission.');