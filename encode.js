window.encode = (val, callback, time) => {
  time = time || 500;
  if (window.__pushed__) return
  setTimeout(function() {
    window.__pushed__ = false
    if(callback) {
      callback();
    }
  }, time)

  const context = window.__context__ || new AudioContext()
  const sampleRate = 8000
  const buffer = context.createBuffer(2, sampleRate, sampleRate)
  const data = buffer.getChannelData(0)
  const data1 = buffer.getChannelData(1)
  currentTime = 0
  const keymaps = {
    '1': [1209, 697],
    '2': [1336, 697],
    '3': [1477, 697],
    'A': [1633, 697],
    '4': [1209, 770],
    '5': [1336, 770],
    '6': [1477, 770],
    'B': [1633, 770],
    '7': [1209, 852],
    '8': [1336, 852],
    '9': [1477, 852],
    'C': [1633, 852],
    '*': [1209, 941],
    '0': [1336, 941],
    '#': [1477, 941],
    'D': [1633, 941]
  }
  if (!keymaps[val]) return

  for (let i = 0; i < time * sampleRate / 1000; i++) {
    data[i] = Math.sin((2 * Math.PI) * keymaps[val][0] * (i / sampleRate))
    data[i] += Math.sin((2 * Math.PI) * keymaps[val][1] * (i / sampleRate))
    data[i] *= 0.5;
    data1[i] = data[i];
  }

  const gainNode = context.createGain()
  gainNode.connect(context.destination)

  const src = context.createBufferSource()
  src.buffer = buffer
  src.connect(gainNode)
  src.start(currentTime)

  window.__pushed__ = true
  if (!window.__context__) window.__context__ = context
}


function execute(phone_number) {
  phone_number.push('*');
  phone_number.push('#');
  phone_number.push(' ');
  //phone_number.push(' ');
  //phone_number.push(' ');
  var result = Promise.resolve();
  phone_number.forEach(char => {
    result = result.then(function() {
      return new Promise((resolve, reject) => {
          encode(char, resolve, 400);
      })
    }).then(function() {
      return new Promise((resolve, reject) => {
          encode(' ', resolve, 410);
      })
    })
  });
  return result;
}

let state = [10,5,0];
let idx = 0;
let set = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D'];
let setlen = set.length;
let pauze = false;

function next() {
  idx++;
  document.getElementById("index").innerHTML = idx;
  let p = state.length -1;
  state[p] += 1;
  while(state[p] >= setlen) {
    state[p] = 0;
    p--;
    if(p < 0){
      return undefined;
    }
    state[p] += 1;
  }
  return state;
}

async function run() {
  pauze = false;
  while(state != undefined && !pauze) {
    await execute(state.map(idx => set[idx]));
    await execute(state.map(idx => set[idx]));
    next();
  }
}
window.run = run;
window.reset = () => {
  state = [10,5,0];
  idx = 0;
}
window.repeat = async () => {
  pauze = false;
  while(state != undefined && !pauze) {
    await execute(state.map(idx => set[idx]));
  }
}
window.halt = () => {
  pauze = true;
}
window.skip = () => {
  let skip = +document.getElementById("skip").value;
  console.log(skip);
  for(let i = 0; i < skip; i++) {
    next();
  }
}
