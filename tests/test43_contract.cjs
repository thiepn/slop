const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const window={};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../s43-cases.js'),'utf8'),{window});const data=window.Slop43Cases;
assert.equal(data.cases.length,44);assert.equal(data.groups.length,11);
const byPage=new Set(data.cases.map(x=>x.page));assert.equal(byPage.size,44);
assert.equal(data.groups.flatMap(g=>g.pages).length,44);
assert.equal(new Set(data.groups.flatMap(g=>g.pages)).size,44);
for(const g of data.groups){assert.equal(g.pages.length,4);for(const page of g.pages)assert.ok(byPage.has(page),page)}
for(const c of data.cases){assert.equal(c.choices.length,3,c.page);assert.equal(c.answers.length,3,c.page);assert.equal(typeof c.insight,'string');assert.equal(typeof c.clue,'string');assert.ok(c.insight.length>18,c.page);assert.ok(c.question.includes('?'),c.page);assert.equal(c.correct,0);assert.ok(c.group,c.page);}
assert.equal(data.cross.length,8,'Eight substantive cross-service investigations are expected');
assert.equal(new Set(data.cross.map(c=>c.id)).size,8,'Cross-case identities must be unique');
const groups=new Map(data.groups.flatMap(g=>g.pages.map(page=>[page,g.id])));
const answerPositions=new Set();
for(const x of data.cross){
 assert.equal(x.pages.length,2,x.id);assert.notEqual(x.pages[0],x.pages[1],x.id);
 assert.notEqual(groups.get(x.pages[0]),groups.get(x.pages[1]),'Must compare distinct departments: '+x.id);
 for(const page of x.pages)assert.ok(byPage.has(page),x.id+' '+page);
 assert.equal(x.answers.length,3,x.id);assert.ok(Number.isInteger(x.correct)&&x.correct>=0&&x.correct<3,x.id);
 assert.ok(x.issue.length>45&&x.question.endsWith('?'),x.id);
 for(const resolution of ['publish','mediate','restrict'])assert.ok(x.resolutions[resolution].length>45,x.id+' '+resolution);
 answerPositions.add(x.correct);
}
assert.deepEqual([...answerPositions].sort(),[0,1,2],'Cross-case evidence answers must not share a predictable position');
assert.match(fs.readFileSync(require('node:path').join(__dirname,'../s43-play.js'),'utf8'),/X\.exclusive/);
assert.ok(data.cases.some(c=>c.page==='slopnews.html'));
console.log('PASS 44 micro-missions; 11 dossiers; 8 independently sourced cross-service confrontations with three meaningful resolution paths.');