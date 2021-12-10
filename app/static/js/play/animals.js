//sprites from https://opengameart.org/content/lpc-style-farm-animals

let chickenWalkingSpriteSheet;
let chickenRestingSpriteSheet;
let cowWalkingSpriteSheet;
let cowRestingSpriteSheet;
let pigWalkingSpriteSheet;
let pigRestingSpriteSheet;
let sheepWalkingSpriteSheet;
let sheepRestingSpriteSheet;

function calculateSizeRepresent(quantity) {
    let result = log(quantity) / log(animalQuantityBreakpoint)
    console.log(result)
    return floor(result)
}

function directionToOffset(direction) {
    switch (direction) {
        case "north":
            return 0;
        case "east":
            return 3;
        case "south":
            return 2;
        case "west":
            return 1;
        default:
            return 2;
    }
}

function borderX(x, size) {
    if (x + (2*size) > width-padding) {
        return width-padding-(2*size);
    } else if (x - size < padding) {
        return padding+size;
    }
    return x;
}

function borderY(y, size) {
    if (y + (2*size) > height-padding) {
        return height-padding-(2*size);
    } else if (y - size < padding) {
        return padding+size;
    }
    return y;
}

async function populateAnimals(jsondata) {

    animals = []

    if (!jsondata.success) {
        console.log("Data malformed")
        return;
    }

    let animal_list = jsondata.animals;

    // for (let i = 0; i < animal_list.length; i++) {
    //     console.log(animal_list[i]);
    // }

    animal_list.forEach(arr => {
        let quantity = arr[1]
        while (quantity > 0) {
            let amt = calculateSizeRepresent(quantity);
            quantity -= pow(animalQuantityBreakpoint, amt);
            switch (arr[0]) {
                case "Cow":     animals.push(new Cow(amt));     break;
                case "Chicken": animals.push(new Chicken(amt)); break;
                case "Pig":     animals.push(new Pig(amt));     break;
                case "Sheep":   animals.push(new Sheep(amt));   break;
            }
        }
    })
}

class Animal {
    constructor(sizeRepresent) {
        this.baseSpeed = 0.6;
        this.speed = this.baseSpeed * random(1, 3);
        this.restRequired = random(100, 5000);
        this.restAmount = 0;
        this.scale = random(1, 2);
        this.size = animalSize * this.scale;
        this.x = random(width-(2*padding))+padding;
        this.y = random(height-(2*padding))+padding;
        this.direction = 0;
        this.movementStepsLeft = 0;
        this.walkingImage = 0;
        this.restingImage = 0;
        this.spritesheetSize = 128;
        this.animationCounter = floor(random(0, 100));
        this.x = borderX(this.x, this.size)
        this.y = borderY(this.y, this.size)
        this.sizeRepresent = sizeRepresent || 0;
    }

    move() {
        if (this.movementStepsLeft > 0) {
            this.x += this.speed * cos(this.direction);
            this.y += this.speed * sin(this.direction);

            let xorig = this.x
            let yorig = this.y

            this.x = borderX(this.x, this.size);
            this.y = borderY(this.y, this.size);

            if (xorig != this.x || yorig != this.y) {
                this.movementStepsLeft = 0;
            }

            this.movementStepsLeft--;
            return;
        }
        if (this.restAmount < this.restRequired) {
            this.restAmount++;
            return;
        }

        this.restAmount = 0;
        this.direction = floor(random(0, 360));
        this.movementStepsLeft = random(10, 200);

    }

    display() {
        stroke(0);
        strokeWeight(1);
        this.animationCounter++;
        let animationStep = floor(this.animationCounter / 30);

        let img = this.restingImage;

        //if moving
        if (this.movementStepsLeft > 0) {
            img = this.walkingImage;
            animationStep = floor(this.animationCounter / (6*this.speed));
        }


        if (img == 0) {
            ellipse(this.x, this.y, this.size, this.size);
            return;
        }

        let subImageYPosition = directionToOffset(this.predominantDirection());
        let subImageXPosition = animationStep % 4;

        let sx = subImageXPosition * this.spritesheetSize;
        let sy = subImageYPosition * this.spritesheetSize;
        let sWidth = this.spritesheetSize;
        let sHeight = this.spritesheetSize;


        image(img, this.x, this.y, this.size, this.size, sx, sy, sWidth, sHeight)
        //image(img, sx, sy, sWidth, sHeight, this.x, this.y, this.size, this.size)
    }

    predominantDirection() {
        let xamt = cos(this.direction);
        let yamt = sin(this.direction);

        let EorW = xamt > 0 ? "east" : "west";
        let NorS = yamt >= 0 ? "south" : "north";

        return abs(xamt) > abs(yamt) ? EorW : NorS;
    }

    setupImage() {

        let pg = createGraphics(this.spritesheetSize * 4, this.spritesheetSize * 4);
        let pg2 = createGraphics(this.spritesheetSize * 4, this.spritesheetSize * 4);

        pg.image(this.restingImage, 0, 0)
        this.setTint(pg);
        this.test = pg.get();

        pg.clear()

        pg.image(this.restingImage, 0, 0)
        this.setTint(pg);
        this.restingImage = pg.get();

        pg.clear()

        pg.image(this.walkingImage, 0, 0)
        this.setTint(pg)
        this.walkingImage = pg.get();
    }

    setTint(graphicsObject) {
        //console.log("set tint called with sr:" + this.sizeRepresent.toString())
        switch (this.sizeRepresent) {
            case 1:  graphicsObject.tint(170,   0,   0); break; //d red
            case 2:  graphicsObject.tint(  0, 170,   0); break; //d green
            case 3:  graphicsObject.tint(0  , 170, 170); break; //d blue
            case 4:  graphicsObject.tint(170,   0, 170); break; //purple
            case 5:  graphicsObject.tint(255,  85,  85); break; //l red
            case 6:  graphicsObject.tint( 85, 255,  85); break; //l green
            case 7:  graphicsObject.tint(85 , 255, 255); break; //l blue
            case 8:  graphicsObject.tint(255,  85, 255); break; //pink
            case 9:  graphicsObject.tint(255, 255,  85); break; //yellow
            default: graphicsObject.noTint(); break;
        }

    }

    setTintOld() {
        switch (this.sizeRepresent) {
            case 0:  noTint(); break;
            case 1:  tint(170,   0,   0); break; //d red
            case 2:  tint(  0, 170,   0); break; //d green
            case 3:  tint(0  , 170, 170); break; //d blue
            case 4:  tint(170,   0, 170); break; //purple
            case 5:  tint(255,  85,  85); break; //l red
            case 6:  tint( 85, 255,  85); break; //l green
            case 7:  tint(85 , 255, 255); break; //l blue
            case 8:  tint(255,  85, 255); break; //pink
            case 9:  tint(255, 255,  85); break; //yellow
        }
    }

}

class Cow extends Animal {
    constructor(sizeRepresent) {
        super(sizeRepresent);
        this.scale = random(1.5, 2.2);
        this.size = animalSize * this.scale;
        this.speed = this.baseSpeed * random(1, 3);
        this.walkingImage = cowWalkingSpriteSheet;
        this.restingImage = cowRestingSpriteSheet;
        this.setupImage()
    }

    // display() {
    //     stroke(0);
    //     strokeWeight(1);
    //     fill(255);
    //
    //     //length and height proportions
    //     let p_length = 1.625;
    //     let p_height = 1;
    //
    //     //legs first
    //
    //     let frontShoulderX = (this.size*p_length/4);
    //     let frontShoulderY = (this.size*p_height/2);
    //     let rearShoulderX = (this.size*p_length/4)*3;
    //     let rearShoulderY = (this.size*p_height/2);
    //
    //     strokeWeight(4);
    //     line(this.x+frontShoulderX, this.y+frontShoulderY, this.x, this.y+(this.size*p_height*p_length));
    //     line(this.x+frontShoulderX, this.y+frontShoulderY, this.x+(frontShoulderX/2), this.y+(this.size*p_height*p_length));
    //
    //     line(this.x+rearShoulderX, this.y+frontShoulderY, this.x+(rearShoulderX+(frontShoulderX/2)), this.y+(this.size*p_height*p_length));
    //     line(this.x+rearShoulderX, this.y+frontShoulderY, this.x+(rearShoulderX), this.y+(this.size*p_height*p_length));
    //
    //     //body second
    //     strokeWeight(2);
    //     rect(this.x, this.y, this.size*p_length, this.size*p_height, this.size / 6)
    //     ellipse(this.x, this.y, this.size*p_height, this.size*p_height);
    // }
}

class Chicken extends Animal {
    constructor(sizeRepresent) {
        super(sizeRepresent);
        this.scale = random(0.5, 0.6);
        this.size = animalSize * this.scale;
        this.speed = this.baseSpeed * random(2, 4);
        this.spritesheetSize = 32;
        this.walkingImage = chickenWalkingSpriteSheet;
        this.restingImage = chickenRestingSpriteSheet;
        this.setupImage()
    }

    // display() {
    //     stroke(0);
    //     strokeWeight(1);
    //     fill("#d1ad84");
    //
    //     //length and height proportions
    //     let p_length = 1.2;
    //     let p_height = 1;
    //
    //     //legs first
    //
    //     let frontShoulderX = (this.size*p_length/2);
    //     let frontShoulderY = (this.size*p_height/2);
    //
    //     strokeWeight(4);
    //     //line(this.x+frontShoulderX, this.y+frontShoulderY, this.x, this.y+1.4*(this.size*p_height*p_length));
    //     line(this.x+frontShoulderX, this.y+frontShoulderY, this.x+(frontShoulderX/2), this.y+(1.4*this.size*p_height*p_length));
    //     line(this.x+frontShoulderX, this.y+frontShoulderY, this.x+(1.5*frontShoulderX), this.y+1.4*(this.size*p_height*p_length));
    //
    //     //body second
    //     strokeWeight(2);
    //     rect(this.x, this.y, this.size*p_length, this.size*p_height, this.size / 6)
    //     ellipse(this.x, this.y, this.size*p_height*0.8);
    // }
}

class Pig extends Animal {
    constructor(sizeRepresent) {
        super(sizeRepresent);
        this.scale = random(1.8, 2);
        this.size = animalSize * this.scale;
        this.speed = this.baseSpeed * random(1, 4);
        this.restingImage = pigRestingSpriteSheet;
        this.walkingImage = pigWalkingSpriteSheet;
        this.setupImage()
    }

    // display() {
    //     stroke(0);
    //     strokeWeight(1);
    //     fill("#e8a2f2");
    //
    //     //length and height proportions
    //     let p_length = 1.8;
    //     let p_height = 0.9;
    //
    //     //legs first
    //
    //     let frontShoulderX = (this.size*p_length/4);
    //     let frontShoulderY = (this.size*p_height/2);
    //     let rearShoulderX = (this.size*p_length/4)*3;
    //     let rearShoulderY = (this.size*p_height/2);
    //
    //     strokeWeight(4);
    //     line(this.x+frontShoulderX, this.y+frontShoulderY, this.x, this.y+0.75*(this.size*p_height*p_length));
    //     line(this.x+frontShoulderX, this.y+frontShoulderY, this.x+(frontShoulderX/2), this.y+0.75*(this.size*p_height*p_length));
    //
    //     line(this.x+rearShoulderX, this.y+frontShoulderY, this.x+(rearShoulderX+(frontShoulderX/2)), this.y+0.75*(this.size*p_height*p_length));
    //     line(this.x+rearShoulderX, this.y+frontShoulderY, this.x+(rearShoulderX), this.y+0.75*(this.size*p_height*p_length));
    //
    //     //body second
    //     strokeWeight(2);
    //     rect(this.x, this.y, this.size*p_length, this.size*p_height, this.size / 6)
    //     ellipse(this.x, this.y, this.size*p_height*0.9);
    // }
}

class Sheep extends Animal {
    constructor(sizeRepresent) {
        super(sizeRepresent);
        this.scale = random(1.7, 2);
        this.size = animalSize * this.scale;
        this.speed = this.baseSpeed * random(2, 4);
        this.walkingImage = sheepWalkingSpriteSheet;
        this.restingImage = sheepRestingSpriteSheet;
        this.setupImage()
    }

    // display() {
    //     stroke(0);
    //     strokeWeight(1);
    //     fill(255);
    //
    //     //length and height proportions
    //     let p_length = 1.4;
    //     let p_height = 1;
    //
    //     //legs first
    //
    //     let frontShoulderX = (this.size*p_length/4);
    //     let frontShoulderY = (this.size*p_height/2);
    //     let rearShoulderX = (this.size*p_length/2.8)*3;
    //     let rearShoulderY = (this.size*p_height/2);
    //
    //     strokeWeight(4);
    //     line(this.x+frontShoulderX, this.y+frontShoulderY, this.x, this.y+(this.size*p_height*p_length));
    //     line(this.x+frontShoulderX, this.y+frontShoulderY, this.x+(frontShoulderX/2), this.y+(this.size*p_height*p_length));
    //
    //     line(this.x+rearShoulderX, this.y+frontShoulderY, this.x+(rearShoulderX+(frontShoulderX/2)), this.y+(this.size*p_height*p_length));
    //     line(this.x+rearShoulderX, this.y+frontShoulderY, this.x+(rearShoulderX), this.y+(this.size*p_height*p_length));
    //
    //     //body second
    //     strokeWeight(2);
    //     //rect(this.x, this.y, this.size*p_length, this.size*p_height, this.size / 6)
    //
    //     ellipse(this.x+this.size/2, this.y+this.size/2, this.size*p_height, this.size*p_height);
    //     ellipse(this.x+3*this.size/2, this.y+this.size/2, this.size*p_height, this.size*p_height);
    //     ellipse(this.x+2*this.size/2, this.y+this.size/2, this.size*p_height);
    //
    //     //head last
    //     ellipse(this.x, this.y, this.size*p_height*0.7);
    // }
}