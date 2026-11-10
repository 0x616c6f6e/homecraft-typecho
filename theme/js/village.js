/** Hand-built voxel architecture on the starter island; coordinates are metres. */
export const BUILDINGS = [
  { id: 'cottage', name: '木屋', x0: -20, x1: -10, z0: 2, z1: 11, height: 4, door: [-16, -14], wall: 'planks' },
  { id: 'library', name: '书屋', x0: 7, x1: 19, z0: -1, z1: 9, height: 5, door: [12, 14], wall: 'concrete' },
  { id: 'tower', name: '瞭望塔', x0: -15, x1: -8, z0: -18, z1: -10, height: 9, door: [-13, -11], wall: 'stone' },
];

export function buildVillage(grid) {
  // Reuse the engine atlas and greedy voxel meshing; no downloaded models or lights.
  grid.define('village-roof', { tex: { all: 'deepslate' }, merge: true });
  grid.define('village-bookshelf', { tex: { all: 'bookshelf' }, merge: true });
  grid.define('village-stone', { tex: { all: 'stone' }, merge: true });
  const fill = (x0,y0,z0,x1,y1,z1,block) => grid.fill(x0,y0,z0,x1,y1,z1,block,'village');
  const path = (x0,z0,x1,z1) => fill(x0,-1,z0,x1,0,z1,'pavers');
  path(-2,-20,3,24);
  path(-21,11,21,14);
  path(11,9,15,14);
  path(-16,-9,3,-6);
  path(-13,-10,-11,-6);
  for (const b of BUILDINGS) {
    const {x0,x1,z0,z1,height:h,door,wall}=b;
    fill(x0,-1,z0,x1,0,z1,'planks');
    fill(x0,0,z0,x1,h,z0+1,wall);
    fill(x0,0,z1-1,x1,h,z1,wall);
    fill(x0,0,z0,x0+1,h,z1,wall);
    fill(x1-1,0,z0,x1,h,z1,wall);
    // A genuine two-block-wide, three-block-high entrance, not a painted door.
    fill(door[0],0,z1-1,door[1],3,z1,null);
    for (const x of [x0,x1-1]) for (const z of [z0,z1-1]) fill(x,0,z,x+1,h,z+1,b.id==='tower'?'village-stone':'log');
    // Windows sit above floor level; side walls remain solid in the collision grid.
    fill(x0,1,z0+3,x0+1,3,z1-2,'glass');
    fill(x1-1,1,z0+3,x1,3,z1-2,'glass');
    fill(x0+2,1,z0,x1-2,3,z0+1,'glass');
    if (b.id==='tower') {
      fill(x0-1,h,z0-1,x1+1,h+1,z1+1,'village-stone');
      for (let x=x0-1;x<=x1;x+=2) for (const z of [z0-1,z1]) fill(x,h+1,z,x+1,h+2,z+1,'village-stone');
      for (let z=z0+1;z<z1;z+=2) for (const x of [x0-1,x1]) fill(x,h+1,z,x+1,h+2,z+1,'village-stone');
      fill(x0,6,z0+2,x0+1,8,z1-2,'glass');
      fill(x1-1,6,z0+2,x1,8,z1-2,'glass');
    } else {
      // Closed gable ends and stepped eaves give the roofs a block-built silhouette.
      let left=x0-1,right=x1+1,y=h;
      while (left<right) {
        fill(left,y,z0-1,right,y+1,z1+1,'village-roof');
        if (left+1<right-1) {
          fill(left+1,y,z0,right-1,y+1,z0+1,wall);
          fill(left+1,y,z1-1,right-1,y+1,z1,wall);
        }
        left++;right--;y++;
      }
      if (b.id==='cottage') fill(x0+2,h,z0+2,x0+4,h+4,z0+4,'village-stone');
      // A bench and a writing desk, leaving the centre/entrance unobstructed.
      fill(x0+1,0,z0+2,x0+2,1,z1-2,'planks');
      fill(x1-3,0,z0+1,x1-1,1,z0+3,'planks');
      if (b.id==='library') fill(x0+2,0,z0+1,x1-4,3,z0+2,'village-bookshelf');
    }
  }
  // Native ground sources allow flying visitors to land on all three roofs.
  const roofs = {
    levels(x,z,out) {
      if (!BUILDINGS.some(b=>x>=b.x0-1&&x<b.x1+1&&z>=b.z0-1&&z<b.z1+1)) return;
      for(let y=3;y<=12;y++) if(grid.type(Math.floor(x),y,Math.floor(z))&&!grid.type(Math.floor(x),y+1,Math.floor(z))&&!grid.type(Math.floor(x),y+2,Math.floor(z))) out.push({y:y+1,site:'village-roof'});
    },
  };
  return { roofs, buildings: BUILDINGS };
}
