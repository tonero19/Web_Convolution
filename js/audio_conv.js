//Author: Adib Ali

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

//Check for Web Audio API support
if(window.AudioContext && window.OfflineAudioContext){

}else{
    alert('Web Audio API is not fully supported in this browser');
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var offlineCtx;
var offlineConvolver;
var convolverBuffer;
var offlineContextSource;
var inputAudioBuffer;
var ownAudioFileURL;
var ownAudioFileName;
var inputAudioPresetURL;
var ownIRFileName;
var ownIRFileURL;
var irPresetURL;
var outputBlobURL;
var blob;

var audioPreset = document.getElementById('audioPreset');
var irPresetList = document.getElementById('irPresetList');
var inputSound = document.getElementById('inputSound');
var outputSound = document.getElementById('outputSound');

function onAudioSelect(evt) {
    var selectedPreset = audioPreset.value;

    switch (selectedPreset) {
        case 'theForce':
            inputAudioPresetURL = 'music/force.mp3';
            break;
        case 'chime':
            inputAudioPresetURL = 'music/chime.mp3';
            break;
    }

    //Sets the player's src to control playback
    inputSound.src = inputAudioPresetURL;

    //Check radio button
    document.getElementById('audioPresetRadio').checked = true;

    var ajaxRequest = new XMLHttpRequest();

    ajaxRequest.open('GET', inputAudioPresetURL, true);
    ajaxRequest.responseType = 'arraybuffer';

    ajaxRequest.onload = function (e) {
        var audioData = ajaxRequest.response;
        audioCtx.decodeAudioData(audioData, setInputBuffer, function (e) { "Error with decoding audio data" + e.err });
    }
    ajaxRequest.send();
}



function handleAudioFileSelect(evt) {
    var files = evt.target.files; // FileList object

    //Set src for the player
    ownAudioFileURL = URL.createObjectURL(this.files[0]);
    inputSound.src = ownAudioFileURL;
    ownIRFileName = this.files[0].name;
    var fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.files[0]);
    fileReader.onload = function () {
        var fileArrayBuffer = this.result;
        audioCtx.decodeAudioData(fileArrayBuffer, setInputBuffer);
    }
    document.getElementById('ownAudioFile').checked = true;
}

setInputBuffer = function (buffer) {

    inputAudioBuffer = audioCtx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        inputAudioBuffer.copyToChannel(buffer.getChannelData(channel), channel);
    }

}

function loadIRPreset(audioURL) {
    document.getElementById('impulseResponse').src = audioURL;
    var ajaxRequest = new XMLHttpRequest();

    ajaxRequest.open('GET', audioURL, true);
    ajaxRequest.responseType = 'arraybuffer';

    ajaxRequest.onload = function (e) {
        var audioData = ajaxRequest.response;
        audioCtx.decodeAudioData(audioData, setConvolverBuffer, function (e) { "Error with decoding audio data" + e.err });
    }
    ajaxRequest.send();
}

function onIrPresetSelect(evt) {
    var selectedPreset = irPresetList.value;
    switch (selectedPreset) {
        case 'carpark':
            irPresetURL = 'music/carpark_balloon_ir_stereo_24bit_44100.wav';
            break;
        case 'centre_stalls':
            irPresetURL = 'music/ir_centre_stalls.wav';
            break;
        case 'aula_carolina':
            irPresetURL = 'music/aula_carolina.wav';
            break;
        case 'corridor':
            irPresetURL = 'music/corridor.wav';
            break;
        case 'meeting_room':
            irPresetURL = 'music/meeting_room.wav';
            break;
        case 'office':
            irPresetURL = 'music/office.wav';
            break;
        case 'stairway':
            irPresetURL = 'music/stairway.wav';
            break;
    }
    loadIRPreset(irPresetURL);
    document.getElementById('irPresetRadio').checked = true;
}

function handleIRFileSelect(evt) {

    var impulseResponseSound = document.getElementById('impulseResponse');
    ownIRFileURL = URL.createObjectURL(this.files[0]);
    //Set src of the player
    impulseResponseSound.src = ownIRFileURL;
    ownIRFileName = this.files[0].name;
    var files = evt.target.files;

    var fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.files[0]);
    fileReader.onload = function () {
        var IRFileArrayBuffer = this.result;
        audioCtx.decodeAudioData(IRFileArrayBuffer, setConvolverBuffer);
    }


    document.getElementById('ownIrFile').checked = true;
}

setConvolverBuffer = function (buffer) {

    convolverBuffer = audioCtx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        convolverBuffer.copyToChannel(buffer.getChannelData(channel), channel);
    }
}

function convolve() {
    
    var renderingText = document.createTextNode("Rendering...");
    var renderedText = document.createTextNode("Rendered");
    
    var node = document.getElementById('renderStatus');
    if(node.childNodes.length>0){
        node.removeChild(node.lastChild);
    }
    node.appendChild(renderingText);
    
    //Offline context can only be used once. New one has to be recreated everytime
    //Convolution result length is the sum of both input lengths
    offlineCtx = new OfflineAudioContext(2, inputAudioBuffer.length + convolverBuffer.length, inputAudioBuffer.sampleRate);
    offlineContextSource = offlineCtx.createBufferSource();
    offlineContextSource.buffer = inputAudioBuffer;

    offlineConvolver = offlineCtx.createConvolver();
    offlineConvolver.buffer = convolverBuffer;

    offlineContextSource.connect(offlineConvolver);
    offlineConvolver.connect(offlineCtx.destination);
    offlineContextSource.start();

    offlineCtx.startRendering().then(function (renderedBuffer) {

        node.removeChild(renderingText);
        node.appendChild(renderedText);


        // start a new worker 
        var worker = new Worker('js/libs/recorderWorker.js');

        // initialize the new worker
        worker.postMessage({
            command: 'init',
            config: { sampleRate: offlineCtx.sampleRate }
        });

        // callback for `exportWAV`
        worker.onmessage = function (e) {
            blob = e.data;
            outputBlobURL = URL.createObjectURL(blob);
            outputSound.src = outputBlobURL;
        };

        // send the channel data from our buffer to the worker
        worker.postMessage({
            command: 'record',
            buffer: [
                renderedBuffer.getChannelData(0),
                renderedBuffer.getChannelData(1)
            ]
        });

        // ask the worker for a WAV
        worker.postMessage({
            command: 'exportWAV',
            type: 'audio/wav'
        });
    });
}

function downloadFile() {
    var filename = "";
    if (document.getElementById('audioPresetRadio').checked) {
        filename = filename.concat(audioPreset.value);
    } else if (document.getElementById('ownAudioFile').checked) {
        filename = filename.concat(ownAudioFileName);
    }

    filename = filename.concat(" in ");

    if (document.getElementById('irPresetRadio').checked) {
        filename = filename.concat(irPresetList.value);
    } else if (document.getElementById('ownIrFile').checked) {
        filename = filename.concat(ownIRFileName);
    }

    var element = document.createElement('a');

    element.setAttribute('href', outputBlobURL);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

}

function onOwnAudioClick() {
    setInputBuffer(fileArrayBufferDecoded);
    inputSound.src = ownAudioFileURL;
}

function onIRPresetClick() {
    loadIRPreset(irPresetURL);
}

function onOwnIRClick() {
    loadIRPreset(ownIRFileURL);
}

//Event listeners 
document.getElementById('files').addEventListener('change', handleAudioFileSelect, false);
document.getElementById('iFiles').addEventListener('change', handleIRFileSelect, false);
irPresetList.addEventListener('change', onIrPresetSelect, false);
audioPreset.addEventListener('change', onAudioSelect, false);

//radio buttons
document.getElementById('audioPresetRadio').addEventListener('click', onAudioSelect, false);
document.getElementById('ownAudioFile').addEventListener('click', onOwnAudioClick, false);
document.getElementById('irPresetRadio').addEventListener('click', onIRPresetClick, false);
document.getElementById('ownIrFile').addEventListener('click', onOwnIRClick, false);

document.getElementById('downloadButton').addEventListener("click", downloadFile, false);
document.getElementById('convolveButton').addEventListener('click', convolve, false);
