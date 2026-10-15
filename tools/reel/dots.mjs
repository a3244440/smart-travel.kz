import fs from 'node:fs';
import * as tc from '../pkg/topojson-client-3.1.0/package/dist/topojson-client.js';
const topo = JSON.parse(fs.readFileSync('../pkg/world-atlas-2.0.2/package/countries-50m.json'));
const fc = tc.feature(topo, topo.objects.countries);
const polys = fc.features.map(f => ({ id: f.id, name: f.properties.name, rings: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) }));
function inRing(x, y, r){ let c = false; for(let i=0,j=r.length-1;i<r.length;j=i++){ const [xi,yi]=r[i],[xj,yj]=r[j]; if(((yi>y)!==(yj>y)) && x < (xj-xi)*(y-yi)/(yj-yi)+xi) c=!c; } return c; }
function find(x,y){ for(const p of polys) for(const poly of p.rings){ if(inRing(x,y,poly[0]) && !poly.slice(1).some(h=>inRing(x,y,h))) return p; } return null; }
const out=[]; const S=0.75;
for(let lat=60; lat>=8; lat-=S) for(let lon=18; lon<=96; lon+=S){ const p=find(lon,lat); if(p) out.push([+lon.toFixed(2),+lat.toFixed(2), p.name==='Kazakhstan'?1:p.name==='Saudi Arabia'?2:0]); }
fs.writeFileSync('dots.json', JSON.stringify(out)); console.log(out.length, out.filter(d=>d[2]==1).length, out.filter(d=>d[2]==2).length);
