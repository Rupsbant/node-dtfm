const context = new AudioContext()
const analyser = context.createAnalyser()
const distortion = context.createWaveShaper()
const gainNode = context.createGain()
const biquadFilter = context.createBiquadFilter()
const fftSize = 4096
analyser.fftSize = fftSize
analyser.smoothingTimeConstant = 0

navigator.mediaDevices.getUserMedia({
  audio: true
}).then(
  (stream) => {
    source = context.createMediaStreamSource(stream)
    source.connect(distortion)
    distortion.connect(biquadFilter)
    biquadFilter.connect(analyser)
    //gainNode.connect(analyser)
    //gainNode.connect(context.destination)
    setInterval(analyse, 200)
  }, console.error)

const keys = []
const notes = [
  1209,
  1336,
  1477,
  1633,
  697,
  770,
  852,
  941
]
const coeffs = [
  0,
  1,
  2,
  3,
  0,
  4,
  8,
  12
]
const pads = [
  '1',
  '2',
  '3',
  'A',
  '4',
  '5',
  '6',
  'B',
  '7',
  '8',
  '9',
  'C',
  '*',
  '0',
  '#',
  'D'
]

notes.forEach((note) => {
  keys.push(Math.round(note / (44100 / fftSize)))
})
console.log(keys);

function analyse() {
  function append(char) {
    let div = document.getElementById('dtmf');
    if (char == undefined &&  div.innerHTML.slice(-1) != ' ') {
      div.innerHTML += ' ';
    } else if (char != undefined && char != div.innerHTML.slice(-1)) {
      div.innerHTML += char;
    }
  }

  function average(data, len) {
    let avg = 0;
    for (let i = 0; i < len; i++) {
      avg += data[i]
    }
    return avg / len
  }

  function max2(data, len) {
    let m1 = 0;
    let m2 = 0;
    let mp1 = -1;
    let mp2 = -1;
    for (let i = 0; i < len; i++) {
      if (data[i] > m1) {
        m2 = m1;
        mp2 = mp1;
        m1 = data[i];
        mp1 = i
      } else if (data[i] > m2) {
        m2 = data[i]
        mp2 = i
      }
    }
    return {
      m1: m1,
      m2: m2,
      mp1: mp1,
      mp2: mp2
    }
  }

  let count = 0
  let len = analyser.frequencyBinCount;
  let data = new Uint8Array(len)
  analyser.getByteFrequencyData(data)
  let tones = [];
  keys.forEach((pos) => {
    tones.push(data[pos])
  })
  let max = max2(tones, 8);
  let avg = average(tones, 8);
  if (max.m2 > 100) {
    let coeff = coeffs[max.mp1] + coeffs[max.mp2];
    append(pads[coeff])
  } else {
    append(undefined)
  }
}
