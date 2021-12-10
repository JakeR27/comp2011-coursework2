let endpoint = "http://web.jakebs.xyz/api/v1/"

function fetchFarmMeData(callback) {
    return fetch(endpoint + "farm/me/data")
}

function fetchFarmMeExtra(callback) {
    return fetch(endpoint + "farm/me/extra")
}

function fetchFarmMeAnimals() {
    return fetch(endpoint + "farm/me/animals")
}

function fetchFarmMeProducts() {
    return fetch(endpoint + "farm/me/products")
}

function sendFarmMeSold(item, quantity) {
    return fetch(endpoint + "farm/me/sold" + "?item=" + item + "&quantity=" + quantity)
}

function sendFarmMeBuy(item, quantity) {
    return fetch(endpoint + "farm/me/buy" + "?item=" + item + "&quantity=" + quantity)
}

function fetchFarmMeNewProducts() {
    return fetch(endpoint + "farm/me/update/products")
}

function sendFarmMeNewScreenshot(screenshot) {
    return fetch(endpoint + "farm/me/update/screenshot", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(screenshot)
    })
}