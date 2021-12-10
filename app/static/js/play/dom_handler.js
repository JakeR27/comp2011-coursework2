let productTimeRemaining = 60;

function sell(obj, quantity) {
    console.log("selling")
    console.log(obj)

    sendFarmMeSold(obj, quantity)
        .then(response=>response.json())
        .then(data=>{
            updateNeeded = 1;
    })
}

function buyPressed() {
    let chosenanimal = document.getElementById("animal").selectedOptions[0].text;
    let quantity = document.getElementById("quantity").value;
    buy(chosenanimal, quantity);
    document.body.scrollTop = document.getElementById("top-div").scrollTop = 0;
}

function buy(obj, quantity) {
    console.log("buying")
    console.log(obj)

    if (!quantity) return;

    sendFarmMeBuy(obj, quantity)
        .then(response=>response.json())
        .then(data=>{
            updateNeeded = 1;
    })
}

function updateCollectProductsButton() {
    if (productTimeRemaining > 0) {
        document.getElementById("refresh-ctr").textContent = " in " + productTimeRemaining.toString() + "s";
    } else {
        document.getElementById("refresh-ctr").textContent = "";
    }

}

function refreshProducts() {
    fetchFarmMeNewProducts()
        .then(response=>response.json())
        .then(data=>{
            productTimeRemaining = 60;
            updateCollectProductsButton();
            updateNeeded =1;
        })
}

function updateDOM(jsondata) {
    if (!jsondata.success) {
        console.log("Data malformed")
        return;
    }

    let animal_list = jsondata.animals;
    if (!animal_list) animal_list = [["none"]];

    let product_list = jsondata.products;
    if (!product_list) product_list = [["none"]]

    // for (let i = 0; i < animal_list.length; i++) {
    //     console.log(animal_list[i]);
    // }

    animal_list.forEach(arr => {
        if (arr[0] == "Cow") {
            document.getElementById("Cow-quantity").textContent = arr[1].toString()
            updateAnimalButton("Cow", arr[1])
        }
        if (arr[0] == "Chicken") {
            document.getElementById("Chicken-quantity").textContent = arr[1].toString()
            updateAnimalButton("Chicken", arr[1])
        }
        if (arr[0] == "Pig") {
            document.getElementById("Pig-quantity").textContent = arr[1].toString()
            updateAnimalButton("Pig", arr[1])
        }
        if (arr[0] == "Sheep") {
            document.getElementById("Sheep-quantity").textContent = arr[1].toString()
            updateAnimalButton("Sheep", arr[1])
        }
    })

    product_list.forEach(arr => {
        if (arr[0] == "Egg") {
            document.getElementById("Egg-quantity").textContent = arr[1].toString()
            updateProductButton("Egg", arr[1])
        }
        if (arr[0] == "Poultry") {
            document.getElementById("Poultry-quantity").textContent = arr[1].toString()
            updateProductButton("Poultry", arr[1])
        }
        if (arr[0] == "Milk") {
            document.getElementById("Milk-quantity").textContent = arr[1].toString()
            updateProductButton("Milk", arr[1])
        }
        if (arr[0] == "Beef") {
            document.getElementById("Beef-quantity").textContent = arr[1].toString()
            updateProductButton("Beef", arr[1])
        }
        if (arr[0] == "Fat") {
            document.getElementById("Fat-quantity").textContent = arr[1].toString()
            updateProductButton("Fat", arr[1])
        }
        if (arr[0] == "Pork") {
            document.getElementById("Pork-quantity").textContent = arr[1].toString()
            updateProductButton("Pork", arr[1])
        }
        if (arr[0] == "Wool") {
            document.getElementById("Wool-quantity").textContent = arr[1].toString()
            updateProductButton("Wool", arr[1])
        }
        if (arr[0] == "Mutton") {
            document.getElementById("Mutton-quantity").textContent = arr[1].toString()
            updateProductButton("Mutton", arr[1])
        }
    })
}

function updateAnimalButton(animalStr, quantity) {
    let btn1 = document.getElementById(animalStr + "-btn1")
    let btn2 = document.getElementById(animalStr + "-btn2")
    if (quantity == 0) {
        btn1.setAttribute("disabled", "")
        btn2.setAttribute("disabled", "")
        btn1.textContent = "Sell"
        btn2.textContent = "Sell"
    } else {
        btn1.removeAttribute("disabled")
        btn2.removeAttribute("disabled")
        btn1.textContent = "Sell 1"
        btn2.textContent = "Sell all"
    }
}

function updateProductButton(productStr, quantity) {
    let btn1 = document.getElementById(productStr + "-btn1")
    if (quantity == 0) {
        btn1.setAttribute("disabled", "")
        btn1.textContent = "Sell"
    } else {
        btn1.removeAttribute("disabled")
        btn1.textContent = "Sell all"
    }
}