const data = {
  active: false,
  videoEl: null,
  canvasEl: null,
  fileData: null,
  isStartEnabled: true,
  currentStream: null,
  isPhoto: false,
  devices: [],
  constraints: {},
  selectedDevice: null,
  cameraState: true,
  options: [],
};

function enableBtn(id) {
  let el = document.querySelector(`#${id}`);
  if (el.classList.contains("disabled")) {
    el.classList.remove("disabled");
  }
}
function disableBtn(id) {
  let el = document.querySelector(`#${id}`);
  if (!el.classList.contains("disabled")) {
    el.classList.add("disabled");
  }
}

function start() {
  stop();
  document.querySelector("#video-container").classList.remove("hidden-video");

  enableBtn("camera");

  // debugger;
  getDevices()
    .then((res) => {
      //when first loaded selected device can use 1st option
      data.selectedDevice = data.options[0].value;
      setConstraints();
      console.log("get devices:", res);
    })
    .then(() => {
      getMedia().then((res) => {
        data.isStartEnabled = false;
        data.cameraState = true;
        enableBtn("stop");
        enableBtn("snapshot");
        console.log("get media", res);
      });
    });
}

function setConstraints() {
  const videoContstraints = {};

  if (data.selectedDevice === null) {
    videoContstraints.facingMode = "environment";
  } else {
    videoContstraints.deviceId = {
      exact: data.selectedDevice,
    };
  }

  data.constraints = {
    video: videoContstraints,
    audio: false,
  };
}
async function getMedia() {
  try {
    data.stream = await navigator.mediaDevices.getUserMedia(data.constraints);
    window.stream = data.stream;
    data.currentStream = window.stream;
    data.videoEl.srcObject = window.stream;
    return true;
  } catch (err) {
    throw err;
  }
}
async function getDevices() {
  // trigger prompt for permission
  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("enumerated devices not supported");
    return false;
  }
  try {
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    for (let mediaDevice of allDevices) {
      if (mediaDevice.kind === "videoinput") {
        let option = {};
        option.text = mediaDevice.label;
        option.value = mediaDevice.deviceId;
        data.options.push(option);
        var selection = document.createElement("option");
        selection.value = option.value;
        selection.text = option.text;
        document.querySelector("#device-option").appendChild(selection);
        data.devices.push(mediaDevice);
      }
      // debugger
      document.querySelector("#device-form").classList.remove("hidden-form");
    }

    return true;
  } catch (err) {
    throw err;
  }
}

function resizeCanvas() {
  const aspectRatio = canvasContainer.height / canvasContainer.width;
  const width = videoContainer.offsetWidth;
  const height = videoContainer.offsetHeight;

  canvasContainer.width = width;
  canvasContainer.height = Math.round(width * aspectRatio);
}

function snapShot() {
  document.querySelector("#canvas-container").classList.remove("hidden-canvas");
  // document.querySelector("#canvas-container").width = data.videoEl.videoWidth;
  // document.querySelector("#canvas-container").height = data.videoEl.videoHeight;
  data.canvasEl.width = data.videoEl.videoWidth;
  data.canvasEl.height = data.videoEl.videoHeight;
  data.canvasEl
    .getContext("2d")
    .drawImage(data.videoEl, 0, 0, data.canvasEl.width, data.canvasEl.height);
  data.fileData = data.canvasEl.toDataURL("image/jpeg");
  data.isPhoto = true;
  data.cameraState = false;
  //remove any hidden links used for download
  let hiddenLinks = document.querySelectorAll(".hidden_links");
  for (let hiddenLink of hiddenLinks) {
    document.querySelector("body").remove(hiddenLink);
  }
  enableBtn("download");
}

function stop() {
  console.log("stop clicked");
  //  video.pause();
  if (data.currentStream) {
    data.currentStream.getTracks().forEach((track) => {
      track.stop();
    });
    data.videoEl.srcObject = null;
  }
  if (data.videoEl) {
    data.videoEl.removeAttribute("src");
    data.videoEl.load();
  }
  if (data.canvasEl) {
    data.canvasEl
      .getContext("2d")
      .clearRect(0, 0, data.canvasEl.width, data.canvasEl.height);
  }

  data.isPhoto = false;
  data.cameraState = false;
  disableBtn("stop");
  disableBtn("snapshot");
  disableBtn("download");
  if (document.querySelector("#video-container")) {
    document.querySelector("#video-container").classList.add("hidden-video");
  }
  if (document.querySelector("#canvas-container")) {
    document.querySelector("#canvas-container").classList.add("hidden-canvas");
  }
  if (document.querySelector("#device-form")) {
    document.querySelector("#device-form").classList.add("hidden-form");
  }
}
function download() {
  data.canvasEl.width = data.videoEl.videoWidth;
  data.canvasEl.height = data.videoEl.videoHeight;
  if (data.fileData) {
    data.canvasEl
      .getContext("2d")
      .drawImage(data.videoEl, 0, 0, data.canvasEl.width, data.canvasEl.height);
    let a = document.createElement("a");
    a.classList.add("hidden-link");
    a.href = data.fileData;
    a.textContent = "";
    a.target = "_blank";
    a.download = "photo.jpeg";
    document.querySelector("body").append(a);
    a.click();
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  const videoContainer = document.querySelector("#video-container");
  const canvasContainer = document.querySelector("#canvas-container");
  // canvasContainer.width = videoContainer.width;
  // canvasContainer.height = videoContainer.height;

  let elements = document.querySelectorAll(".home button");

  elements.forEach((element) => {
    disableBtn(element.id);
  });

  // set video
  data.videoEl = document.querySelector("#video");
  data.canvasEl = document.querySelector("#canvas");

  // attach click event listener
  document.querySelector("#camera").addEventListener("click", (e) => {
    console.log("camera click");
    start();
  });
  document.querySelector("#snapshot").addEventListener("click", (e) => {
    console.log("snapshot click");
    snapShot();
  });
  document.querySelector("#stop").addEventListener("click", (e) => {
    console.log("camera stop");
    stop();
  });
  document.querySelector("#download").addEventListener("click", (e) => {
    console.log("camera downlaod");
    download();
  });

  enableBtn("camera");
});