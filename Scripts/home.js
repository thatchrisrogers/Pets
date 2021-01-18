function initHomeView() {
    setBusyTime();
    let busyTimer = setInterval(setBusyTime, 60000);

    if (person !== undefined) {
        appendCareVisitView(initCareVisitView);
    } else {
        appendVisitorView(initVisitorView);
    }   
}
function setBusyTime() {
    let busyTime = new Date();
    let busyTimeElement = document.getElementById("BusyTime");
    if (busyTimeElement) {
        busyTimeElement.innerHTML = 'The Busy Time is ' + busyTime.toDisplayFormat();
    }
}
function appendCareVisitView(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Views/careVisit.html', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.querySelector('#ViewContainer').innerHTML = this.responseText;
            callBackFunction();
        }
    }
    xhttp.send();
}
function appendVisitorView(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Views/visitor.html', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.querySelector('#ViewContainer').innerHTML = this.responseText;
            callBackFunction();
        }
    }
    xhttp.send();
}