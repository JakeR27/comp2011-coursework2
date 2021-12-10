let dev = false;
let padding = 50;
let animalSize = 50;
let animalQuantityBreakpoint = 10;
let font;

let animals = []
let moneyManager;
let updateNeeded = 0;

let playing = true;

function preload() {
    chickenWalkingSpriteSheet = loadImage("static/media/img/animals/chicken_walk.png");
    chickenRestingSpriteSheet = loadImage("static/media/img/animals/chicken_eat.png");
    cowWalkingSpriteSheet = loadImage("static/media/img/animals/cow_walk.png");
    cowRestingSpriteSheet = loadImage("static/media/img/animals/cow_eat.png");
    pigWalkingSpriteSheet = loadImage("static/media/img/animals/pig_walk.png")
    pigRestingSpriteSheet = loadImage("static/media/img/animals/pig_eat.png")
    sheepWalkingSpriteSheet = loadImage("static/media/img/animals/sheep_walk.png")
    sheepRestingSpriteSheet = loadImage("static/media/img/animals/sheep_eat.png")
    font = loadFont("static/media/Roboto-Medium.ttf")
}

function setup() {
    let originalCanvas = document.getElementById("gameCanvas");
    let canvas = createCanvas(originalCanvas.parentElement.offsetWidth, originalCanvas.parentElement.offsetWidth);
    background('#3cb371');

    originalCanvas.parentNode.replaceChild(canvas.canvas, originalCanvas);

    moneyManager = new MoneyManager();

    textFont(font);

    setInterval(() => {
        if (productTimeRemaining > 0) {
            productTimeRemaining--;
        }
        updateCollectProductsButton();
    }, 1000)

    updateNeeded =1;
    //animals.push(new Cow())
}

function draw() {

    if (!playing) return;

    if (updateNeeded) {
        processUpdate();
        updateNeeded = 0;
    }

    background('#3cb371');

    drawFences()

    animals.forEach(animal => {
        animal.move()
        animal.display()
    })

    moneyManager.display();
}

function drawFences() {

    let p = padding //padding

    if (dev) (stroke("red"))
    drawFenceLine(p, p, width-p, p);    //top fence
    if (dev) stroke("cyan")
    drawFenceLine(p, height-p, p, p);   //left fence
    if (dev) stroke("orange")
    drawFenceLine(width-p, p, width-p, height-p); //right fence
    if (dev) stroke("pink")
    drawFenceLine(width-p, height-p, p, height-p); //bottom fence
}

function drawFenceLine(x1, y1, x2, y2) {

    let numPosts = 10;
    stroke("#8d592f");
    for (let i = 0; i < numPosts; i++) {
        drawFencePost(map(i, 0, numPosts, x1, x2), map(i, 0, numPosts, y1, y2))
    }

    let horizontal = !(y2-y1)

    let horizontalSideOffset = 0;
    let verticalSideOffset = 0;

    stroke("#ce986d");
    if (horizontal) {
        strokeWeight(3);
        horizontalSideOffset = 3;
        line(x1, y1+horizontalSideOffset, x2, y2+horizontalSideOffset);
    } else {
        strokeWeight(2);
        verticalSideOffset = 2;
        line(x1+verticalSideOffset, y1, x2+verticalSideOffset, y2);
    }

    line(x1-verticalSideOffset, y1-horizontalSideOffset, x2-verticalSideOffset, y2-horizontalSideOffset);


}

function drawFencePost(x, y) {
    let fullTilt = 6;
    let noTilt = 0;

    let xCenter = width / 2;
    let xDist = abs(xCenter - x);

    let tiltDirection = x > (width / 2) ? -1 : 1;
    let tiltAmount = map(xDist, 0, xCenter, noTilt, fullTilt)

    let fence_height = 20;
    let fence_height_half = fence_height / 2

    strokeWeight(5);
    line(x, y-fence_height_half, x+(tiltDirection*tiltAmount), y+fence_height_half)
}

function processUpdate() {
    fetchFarmMeData().then(response => response.json()).then(data => {
        //console.log(data)
        populateAnimals(data);

        moneyManager.updateValueFromData(data)
        updateDOM(data)
    });
}

function screenshotCanvas() {
    saveFrames("out", "png", 1, 1, data => {
        console.log(data);
        sendFarmMeNewScreenshot(data[0].imageData)
            .then(response=>response.json())
            .then(data => {
                alert("Screenshot published successfully! Why not check the explore tab?");
            });
    })
}