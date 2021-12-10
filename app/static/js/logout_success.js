let counter
let counter_val = 5;

window.onload = () => {
    counter = document.getElementById("counter")
    counter.textContent = counter_val.toString()
}

function update_text() {
    counter_val--;
    counter.textContent = counter_val.toString()
}

function redirect_home() {
    window.location.replace("/")
}
setInterval(update_text, 1000)
setInterval(redirect_home, 5000)