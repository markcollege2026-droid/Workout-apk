/* Forge — offline seed data. No external services. */
(function (root) {
  'use strict';
  const blocks = [
    { id: 'chest', name: 'Chest & Triceps', short: 'Chest / Triceps', icon: 'bench', color: '#ff795b', subtitle: 'Push with purpose' },
    { id: 'back', name: 'Biceps & Back', short: 'Back / Biceps', icon: 'pull', color: '#bba6ff', subtitle: 'Build your foundation' },
    { id: 'legs', name: 'Legs', short: 'Legs', icon: 'legs', color: '#b8d98b', subtitle: 'Strength from the ground up' },
    { id: 'abs', name: 'Abs', short: 'Abs', icon: 'abs', color: '#f5cb78', subtitle: 'Own your center' },
    { id: 'shoulders', name: 'Shoulders', short: 'Shoulders', icon: 'shoulders', color: '#88cbe0', subtitle: 'Make room to grow' },
    { id: 'forearms', name: 'Forearms', short: 'Forearms', icon: 'grip', color: '#e9a2c0', subtitle: 'Grip. Carry. Repeat.' }
  ];
  const rows = [
    // id, name, block, pair group, type, min, max, equipment, conservative suggestion, increment, muscle
    ['bench-press','Bench Press','chest','PRESS','weighted',6,10,'barbell',20,2.5,'Chest'],
    ['incline-bench','Incline Bench','chest','PRESS','weighted',8,12,'barbell',20,2.5,'Chest'],
    ['dips','Dips','chest','TRI','bodyweight',8,12,'bodyweight',0,2.5,'Triceps'],
    ['push-ups','Push Ups','chest','PRESS','bodyweight',10,15,'bodyweight',0,2.5,'Chest'],
    ['push-down','Push Down','chest','TRI','weighted',10,15,'cable',10,1.25,'Triceps'],
    ['skull-crushers','Skull Crushers','chest','TRI','weighted',10,12,'dumbbell',6,1,'Triceps'],
    ['deadlift','Deadlift','back','SOLO','weighted',6,10,'barbell',20,2.5,'Back'],
    ['hammer-curls','Hammer Curls','back','BI','weighted',8,12,'dumbbell',6,1,'Biceps'],
    ['pull-ups','Pull Ups','back','ROW_PULL','bodyweight',6,10,'bodyweight',0,2.5,'Back'],
    ['pull-down','Pull Down','back','ROW_PULL','weighted',8,12,'cable',15,1.25,'Back'],
    ['cable-rows','Cable Rows','back','ROW_PULL','weighted',8,12,'cable',15,1.25,'Back'],
    ['incline-curls','Incline Curls','back','BI','weighted',8,12,'dumbbell',6,1,'Biceps'],
    ['squats','Squats','legs','SOLO','weighted',6,10,'barbell',20,2.5,'Quads'],
    ['lunges','Lunges','legs','LUNGES','weighted',10,12,'dumbbell',6,1,'Quads'],
    ['leg-extensions','Leg Extensions','legs','LEG_ISO','weighted',10,15,'machine',10,2.5,'Quads'],
    ['leg-curls','Leg Curls','legs','LEG_ISO','weighted',10,15,'machine',10,2.5,'Hamstrings'],
    ['calf-raises','Calf Raises','legs','LEG_ISO','weighted',15,20,'machine',20,2,'Calves'],
    ['sit-ups','Sit Ups','abs','ABS','bodyweight',10,15,'bodyweight',0,2.5,'Abs'],
    ['crunches','Crunches','abs','ABS','bodyweight',15,20,'bodyweight',0,2.5,'Abs'],
    ['leg-raises','Leg Raises','abs','ABS','bodyweight',10,15,'bodyweight',0,2.5,'Abs'],
    ['plank','Plank','abs','ABS','timed',30,60,'bodyweight',0,2.5,'Abs'],
    ['overhead-press','Overhead Press','shoulders','OHP','weighted',6,10,'barbell',20,2.5,'Shoulders'],
    ['lateral-raises','Lateral Raises','shoulders','LATERAL','weighted',10,15,'dumbbell',4,1,'Shoulders'],
    ['face-pulls','Face Pulls','shoulders','REAR_SHOULDER','weighted',15,20,'cable',5,1.25,'Rear delts'],
    ['rear-delt-flies','Rear Delt Flies','shoulders','REAR_SHOULDER','weighted',12,15,'dumbbell',4,1,'Rear delts'],
    ['wrist-curls','Wrist Curls','forearms','WRIST','weighted',12,15,'dumbbell',4,1,'Forearms'],
    ['reverse-wrist-curl','Reverse Wrist Curl','forearms','WRIST','weighted',12,15,'dumbbell',2,1,'Forearms'],
    ['farmer-carries','Farmer Carries','forearms','SOLO','timed',40,40,'dumbbell',10,1,'Forearms'],
    ['reverse-curls','Reverse Curls','forearms','WRIST','weighted',10,12,'barbell',20,2.5,'Forearms'],
    ['dumbbell-bench-press','Dumbbell Bench Press','chest','PRESS','weighted',6,10,'dumbbell',8,1,'Chest'],
    ['incline-dumbbell-press','Incline Dumbbell Press','chest','PRESS','weighted',8,12,'dumbbell',6,1,'Chest'],
    ['bench-dips','Bench Dips','chest','TRI','bodyweight',8,12,'bodyweight',0,2.5,'Triceps'],
    ['close-grip-push-ups','Close-Grip Push Ups','chest','TRI','bodyweight',8,12,'bodyweight',0,2.5,'Triceps'],
    ['overhead-dumbbell-triceps-extension','Overhead Dumbbell Triceps Extension','chest','TRI','weighted',10,15,'dumbbell',6,1,'Triceps'],
    ['band-pulldown','Band Pulldown','back','ROW_PULL','weighted',8,12,'cable',5,1.25,'Back'],
    ['one-arm-dumbbell-row','One-Arm Dumbbell Row','back','ROW_PULL','weighted',8,12,'dumbbell',8,1,'Back'],
    ['goblet-squat','Goblet Squat','legs','SOLO','weighted',6,10,'dumbbell',8,1,'Quads'],
    ['sissy-squat','Sissy Squat','legs','LEG_ISO','bodyweight',10,15,'bodyweight',0,2.5,'Quads'],
    ['dumbbell-romanian-deadlift','Dumbbell Romanian Deadlift','legs','LEG_ISO','weighted',10,15,'dumbbell',8,1,'Hamstrings'],
    ['standing-calf-raise-step','Standing Calf Raise on a Step','legs','LEG_ISO','bodyweight',15,20,'bodyweight',0,2,'Calves']
  ];
  const substitutes = {
    'bench-press':['dumbbell-bench-press','push-ups'], 'incline-bench':['incline-dumbbell-press'],
    'dips':['bench-dips','close-grip-push-ups'], 'push-down':['overhead-dumbbell-triceps-extension'],
    'skull-crushers':['overhead-dumbbell-triceps-extension'], 'pull-down':['pull-ups','band-pulldown'],
    'cable-rows':['one-arm-dumbbell-row'], 'pull-ups':['pull-down'], 'squats':['goblet-squat','lunges'],
    'leg-extensions':['sissy-squat','lunges'], 'leg-curls':['dumbbell-romanian-deadlift'],
    'calf-raises':['standing-calf-raise-step'], 'face-pulls':['rear-delt-flies'],
    'rear-delt-flies':['face-pulls'], 'incline-curls':['hammer-curls']
  };
  const warmup = ['bench-press','incline-bench','deadlift','squats','overhead-press'];
  const compounds = [...warmup];
  function createState() {
    const exercises = rows.map((r, i) => ({
      id:r[0], name:r[1], block:r[2], group:r[3], type:r[4], min:r[5], max:r[6], equipment:r[7],
      suggested:r[8], increment:r[9], muscle:r[10], sets:r[0]==='pull-ups'?4:3,
      rest: r[5]===6?150:null, priority:compounds.includes(r[0])?1:2,
      compound:compounds.includes(r[0]), warmup:warmup.includes(r[0]), primary:i<29, active:true,
      order:i, note:'', equipmentTag:r[0]==='band-pulldown'?'Resistance band (kg-equivalent)':'', substitutes:substitutes[r[0]]||[]
    }));
    const targets = {};
    exercises.forEach(e => targets[e.id]={weight:e.equipment==='bodyweight'?0:null,reps:e.min});
    return {
      version:1, createdAt:Date.now(), updatedAt:Date.now(), exercises, targets, suggestions:{},
      sessions:[], session:null, bodyweights:[], pairOverrides:{},
      settings:{
        rest:90, transition:10, warmupRest:45, keepAwake:true, sound:true, vibrate:true,
        warmups:true, triples:false, effort:true, safeJump:5, stallSessions:3,
        barWeight:20, plates:[{weight:1.25,pairs:2},{weight:2.5,pairs:2},{weight:5,pairs:2},{weight:10,pairs:2},{weight:15,pairs:2},{weight:20,pairs:2}],
        dumbbells:[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40],
        cables:Array.from({length:40},(_,i)=>5+i*2.5), machines:Array.from({length:30},(_,i)=>5+i*5),
        addedLoads:[0,1.25,2.5,5,7.5,10,12.5,15,17.5,20,25,30,35,40,45,50],
        reminders:{days:[],time:'18:00'}, selectedBlocks:['chest','back'], budget:null
      }
    };
  }
  const api = {blocks,createState};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  else root.ForgeSeed=api;
})(typeof window !== 'undefined'?window:globalThis);
