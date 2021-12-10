class MoneyManager {
    constructor() {
        this.x = padding;
        this.y = padding / 5;
        this.w = width / 6;
        this.h = 3 * padding / 5;
        this.money = 0;
    }

    updateValue(value) {
        this.money = value;
    }

    updateValueFromData(jsondata) {
        if (!jsondata.success) {
            console.log("Data malformed")
            return;
        }

        let extra_list = jsondata.extra;
        //console.log(extra_list)

        this.updateValue(extra_list[0][0])
    }

    display() {
        stroke(0);
        fill("gold");
        strokeWeight(3);
        textSize(32);
        //rect(this.x, this.y, this.w, this.h)
        ellipse(this.y+this.h/2, this.y+this.h/2, this.h)
        text(this.money.toString(), this.x, this.y-5, this.w, this.h)
    }
}