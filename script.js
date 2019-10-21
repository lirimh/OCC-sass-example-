var objects = [
  {
    icon: 'icon-vehicle',
    name: 'Vehicle'

  },
  {
    icon: 'icon-tree',
    name: 'Tree'

  },
  {
    icon: 'icon-building',
    name: 'Building'

  },
  {
    icon: 'icon-boat',
    name: 'Boat'

  },
  {
    icon: 'icon-house',
    name: 'House'

  },
  {
    icon: 'icon-tower',
    name: 'Tower'

  }
]
var selectedItems = [];
var videos = [];
var videosData = [];
var videoObjects = [];
window.addEventListener('load', function load(event) {
  window.removeEventListener('load', load);
  resize();
})
// ******************************************
//     Responsive sidebar menu
// ******************************************
var windowSize, sidemenu, open, sidemenu_width;
open = false;
sidemenu = document.getElementById('desktop-version');

function resize() {
  // get window size
  windowSize = window.screen.width;
  if (windowSize <= 767) {
    document.getElementById('desktop-version').style.display = 'none';
    document.getElementsByClassName('responsive-sidebar').style.display = 'flex';

  }
  else {
    // document.getElementById('desktop-version').style.display='flex';
  }
}
function openSideMenu() {
  open = !open;
  if (open) {
    sidemenu.classList.add('sidemenu-mobile_style');
    document.getElementById('desktop-version').style.display = 'flex';
    sidemenu_width = document.getElementById('desktop-version').offsetWidth;
    document.getElementById('toggle-btn').style.marginLeft = sidemenu_width - 13 + 'px';
  } else {
    sidemenu.classList.remove('sidemenu-mobile_style');
    document.getElementById('desktop-version').style.display = 'none';
    document.getElementById('toggle-btn').style.marginLeft = '0';
  }
}
// ******************************************
//    select objects 
// ******************************************
function loadIndex() {
  setObjects(objects);
  (function localFileVideoPlayer() {

    var playSelectedFile = async function (event) {
      if (this.files.length <= 2) {
        for (var i = 0; i < this.files.length; i++) {

          await sendUploadedVideos(this.files[i])
          if (videos.length == 2) {
            document.getElementById("file-upload").setAttribute('disabled', true);
          }
        }

      }
      else return;
    }
    var inputNode = document.querySelector('input')
    inputNode.addEventListener('change', playSelectedFile, false)
  })()
}

function sendUploadedVideos(files) {
  var response;
  var params = new FormData();
  params.append("video_file", files);
  const http = new XMLHttpRequest;
  const url = 'http://185.193.177.2:9090/upload_video/';
  http.open("Post", url);
  http.send(params);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 201) {
      response = JSON.parse(http.responseText);
      videos.push({
        id: response.id,
        description: files.name,
        type: files.type,
        remove: files,
        fileName: response.file_name

      });
      localStorage.setItem('videos', JSON.stringify(videos));
      drawUploadVideos(videos);
    }

  }

}
function setObjects(objects) {
  var objectsElement = document.getElementById('objects');
  var objectContainer = document.createElement('div')
  objectContainer.classList.add('row');
  objects.map(element => {

    var item = document.createElement('div');
    item.classList.add('col-4');
    item.innerHTML = "<div class='items ' id='" + element.name + "' onclick=select('" + element.name + "')><i class='" + element.icon + "'></i><span class='item-title'>" + element.name + "</span></div>";
    objectContainer.appendChild(item);
  });
  objectsElement.appendChild(objectContainer);

}
function select(itemName) {
  if (selectedItems.includes(itemName)) {
    selectedItems = selectedItems.filter(el => {
      return el !== itemName;
    })
    document.getElementById(itemName).classList.remove('select-items')
  }
  else {

    selectedItems.push(itemName);
    document.getElementById(itemName).classList.add('select-items')
  }
}
function saveObjects() {
  localStorage.setItem('selectedObject', JSON.stringify(selectedItems));
}

// ******************************************
//     analytics page 
// ******************************************
// get uploaded videos from local storage
function loadAnalytics() {
  getUploadedVideos(JSON.parse(localStorage.getItem('videos')));
  setChartConfig();
  // drawboundries();
}
function getUploadedVideos(videos) {
  var videosContainer = document.getElementById('uploaded-video');
  videos.forEach(element => {
    var videoItem = document.createElement('div');
    videoItem.classList.add('col-12', 'video-item');
    videoItem.setAttribute('id', element.description);
    videoItem.textContent = element.description;
    videosContainer.appendChild(videoItem);
    document.getElementById(element.description).onclick = function () { viewVideo(element.description); }
  });
}
function viewVideo(elementName) {
  document.getElementById(elementName).classList.add('active-video');
  var selectedVideo = JSON.parse(localStorage.getItem('videos')).filter(video => {
    return video.description === elementName;
  })
  processedVideo(selectedVideo[0].id);
}
function processedVideo(videoID) {

  var http = new XMLHttpRequest();
  http.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      getStats(videoID);
    }
  });
  http.open("GET", "http://185.193.177.2:9090/process_video/" + videoID);
  http.send();
}
function getStats(VideoID) {
  var xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function () {
    videoObjects = [];
    if (this.readyState === 4) {
      videoObjects = JSON.parse(this.responseText);
      drawboundries(videoObjects, VideoID);

    }
  });

  xhr.open("GET", "http://185.193.177.2:9090/get_stats/" + VideoID);

  xhr.send();
}
// ******************************************
//     Upload Video
// ******************************************
function drawUploadVideos(videos) {
  document.getElementById('uploaded-video_container').innerHTML = "";
  var videoContainer = document.getElementById('uploaded-video_container');
  videos.forEach(element => {
    var videoEle = document.createElement('div');
    videoEle.setAttribute('id', 'id-' + element.description)
    videoEle.innerHTML = element.description + "<button  id='removeBtn" + element.description + "' style='visibility: hidden;'>X</button>"
    videoContainer.appendChild(videoEle);
    document.getElementById('id-' + element.description).classList.add("upload-videos");
    document.getElementById('removeBtn' + element.description).classList.add("btn-Remove");
    document.getElementById('removeBtn' + element.description).style.visibility = "visible";
    document.getElementById('removeBtn' + element.description).onclick = function () {
      removeVideo(element)
    }

  });

}
function removeVideo(video) {
  document.getElementById('uploaded-video_container').innerHTML = "";
  videos = videos.filter(element => {
    return element !== video;
  })
  if (videos.length > 0) { drawUploadVideos(videos); }
  localStorage.removeItem('videos');
  localStorage.setItem('videos', JSON.stringify(videos));
  document.getElementById("file-upload").removeAttribute('disabled');




}
function setChartConfig(x_axis, y_axis) {
  var datachart = x_axis;
  var customerConfig = {
    "type": "bar",
    gui: {
      contextMenu: {
        empty: true
      }
    },
    'scale-x': {
      labels: y_axis,
    },
    plot: {
      styles: ["#4d7bfd"],/* Bar Fill by Node */

      marker: {
        'background-color': "#243D95",
        'border-color': "#fff",
        'border-width': 2
      },
      tooltip: {
        fontColor: 'white',
        borderWidth: 1,
        borderRadius: '5px',
        alpha: 1,
        padding: '10%'
      }
    },

    "scrollX": {},
    "series": [
      {
        "type": 'bar',
        "values": datachart,
        "backgroundColor": "#4d7bfd",
        'bar-width': '20%',
        hoverState: {
          alpha: 0.4,
          'backgroundColor': '#fff #A7DBF2'

        }
      }
    ]
  };
  zingchart.render({
    id: 'videoAnalytics',
    data: customerConfig,
    height: 275,
    width: '100%',
  });

}
function drawboundries(videoObjects, VideoID) {
  console.log(videoObjects, VideoID)
  var current = JSON.parse(localStorage.getItem('videos')).filter(el => {
    return el.id == VideoID;
  })
  var v = document.getElementById('video')
  v.setAttribute('src', 'http://185.193.177.2:9090/videos/uploads/'+current[0].fileName);
  draw();
}
function draw() {
  var selectedObject = JSON.parse(localStorage.getItem('selectedObject'));
  var currentFrame = $('#currentFrame');
  var video = VideoFrame({
    id: 'video',
    frameRate: 25,
    callback: function (frame) {
      currentFrame.html(frame);
      if (videoObjects[frame]) {

        var chartX_axis = [];
        var charty_axis = [];
        videoObjects[frame].frame_stats.forEach(status => {
          selectedObject.forEach(selected => {
            if (Object.keys(status) == selected) {

              chartX_axis.push(status[selected]);
              charty_axis.push(Object.keys(status));
            }
          })
        })
        setChartConfig(chartX_axis, charty_axis);
      }

    }
  });
  var videoEl = document.getElementById("video");
  function StartPauseHandler(e) {
    if (e.type === "pause") {
      video.video.play();
    } else if (e.type === "playing") {
      video.listen('frame');
      $(this).html('Pause');
    } else {
      if (!this.paused) {
        this.pause();
      } else {
        this.play();
      }
    }
  }

  videoEl.addEventListener("playing", StartPauseHandler);
}