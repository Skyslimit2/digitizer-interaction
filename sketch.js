// ==============================================
// BODYPOSE - BODY TRACKING AS UI INTERACTION
// ==============================================
// This example shows how to use body tracking as a new way to interact
// with objects on screen. Move your nose to control the red dot!
//
// INTERACTION CONCEPT:
// Traditional UI: Touch/click to select objects
// Body Tracking UI: Move your body to hover/select objects
//
// Uses PhoneCamera class from p5-phone for automatic coordinate mapping.
// Works with any ML5 model (FaceMesh, HandPose, BodyPose, etc.)
// ==============================================

// ==============================================
// ADJUSTABLE PARAMETERS
// ==============================================
let SHOW_VIDEO = true;              // Show/hide video feed (toggle with touch)
let SHOW_ALL_KEYPOINTS = true;      // Show all 33 body keypoints (set to false to hide)

// Customize which body point to track:
// 0 = nose (default)
// 11 = left shoulder
// 12 = right shoulder
// 13 = left elbow
// 14 = right elbow
// 15 = left wrist
// 16 = right wrist
// 23 = left hip
// 24 = right hip
// 25 = left knee
// 26 = right knee
// 27 = left ankle
// 28 = right ankle
let TRACKED_KEYPOINT_INDEX = 0;     // Which body point to use for interaction

let CURSOR_SIZE = 30;               // Size of the tracking cursor (body dot)
let CURSOR_COLOR = [255, 50, 50];   // Color of cursor (red)
let KEYPOINT_SIZE = 5;              // Size of all body keypoints (if shown)

// ==============================================
// GLOBAL VARIABLES
// ==============================================
let cam;                            // PhoneCamera instance
let bodypose;                       // ML5 BodyPose model
let poses = [];                     // Detected bodies (updated automatically)                         // Tracked keypoint position (mapped to screen coordinates)
var gif_loadImg, gif_createImg;
let showing1 = false;
let showing2 = false;
let showing3 = false;
let showing4 = false;
let camReady = false;


let savedTime = 0;
let totalTime = 5000;
let countEllipse = 0;

function preload()
{
	cinema = loadImage("angrycat.jpg");
  happy = loadImage("happycat.png");
  spooky = loadImage("spookycat.jpg");
  secret = loadImage("secretdog.jpg");
  gif_loadImg = loadImage("idle.gif");
  gif_createImg = loadImage("scan.gif");
}
// ==============================================
// SETUP - Runs once when page loads
// ==============================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();  // Prevent phone gestures (zoom, refresh)
  
  // Create camera: front camera, mirrored, fit to canvas height
  cam = createPhoneCamera('user', true, 'fitHeight');
  
  // Enable camera (handles initialization automatically)
  enableCameraTap();
  
  // Start ML5 when camera is ready
  cam.onReady(() => {
    // Configure ML5 BodyPose with BlazePose for 3D coordinates
    let options = {
      runtime: 'mediapipe',               // Use MediaPipe runtime (same as HandPose)
      modelType: 'MULTIPOSE_LIGHTNING',  // Fast model for phone
      enableSmoothing: true,              // Smooth tracking
      minPoseScore: 0.25,                 // Minimum confidence threshold
      multiPoseMaxDimension: 256,         // Resolution (lower = faster)
      enableTracking: true,               // Track across frames
      trackerType: 'boundingBox',         // Tracking method
      trackerConfig: {},
      modelUrl: undefined,
      flipped: false,                      // Don't flip in ML5 - cam.mapKeypoint() handles mirroring
    };
    camReady = true;
    // Create BodyPose model with ready callback
    bodypose = ml5.bodyPose('BlazePose', options, modelLoaded);
  });
  leftx = windowWidth/2
  lefty = windowHeight/2

  cheer = loadSound('kids cheering.mp3');
  playing = false;
}

function modelLoaded() {
  // Start detection when model is ready
  bodypose.detectStart(cam.videoElement, (results) => {
    poses = results;
  });
}

// ==============================================
// DRAW - Runs continuously (60 times per second)
// ==============================================
function draw() {
  background('pink');  
  push();
  imageMode(CENTER);
  if (!camReady)
  {
    image(gif_loadImg, leftx, lefty, 150, 260);
  }
  else
  {
    image(gif_createImg, leftx, lefty, 150, 260);
  }
  pop();

  if (showing1 || showing2 || showing3 || showing4)
{
   let passedTime = millis() - savedTime;

   if (passedTime > totalTime) {
      console.log("5 seconds have passed!");
      showing1 = false;
      showing2 = false;
      showing3 = false;
      showing4 = false;
      playing = false;
      savedTime = millis();
}
}
  
	if (poses.length > 0) {
	// Use the first detected person
	let pose = poses[0];

	// Map all keypoints to screen coordinates
	let allPoints = cam.mapKeypoints(pose.keypoints);

	// Make sure the wrist points exist
	if (allPoints[15] && allPoints[16]) {
		let leftWrist = allPoints[15];
		let rightWrist = allPoints[16];

    push();
    fill(0);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(30);
    text("MOVE YOUR LEFT HAND!    FIND THE CATS!!!!", width/2, 100);
    pop();
		
		// Check if either wrist x position <= 400

    leftx = leftWrist.x;
    lefty = leftWrist.y;


		if (leftWrist.x >= 390  && leftWrist.x <= 432 && leftWrist.y >= 678 && leftWrist.y <= 732 || showing1) {
			image(cinema, 0, 0,windowWidth,windowHeight);
      showing1 = true;
      playCheer();
		}
    if (leftWrist.x >= 720 && leftWrist.x <= 800 && leftWrist.y >= 900 && leftWrist.y <= 1000 || showing2) {
      image(spooky, 0, 0,windowWidth,windowHeight);
      showing2 = true;
      playCheer();
    }
    if (leftWrist.y <= 363 && leftWrist.y >= 230 && leftWrist.x <= 500 && leftWrist.x >= 300 || showing3) {
      image(happy, 0, 0,windowWidth,windowHeight);
      showing3 = true;
      playCheer();
    }
    if (leftWrist.x == 820 || showing4){
      image(secret, 0, 0,windowWidth,windowHeight);
      showing4 = true;
      playCheer();
    }
	}
	}
}

function playCheer() {
  if(!playing){
    cheer.play();
    playing = true;
  }
}

// ==============================================
// WINDOW RESIZE - Update canvas when screen rotates
// ==============================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}