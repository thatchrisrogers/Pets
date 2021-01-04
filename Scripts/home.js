function initHomeView() {   
    if (person !== undefined) {
        appendCareVisitView(initCareVisitView);
    } else {
        appendSplashView();
    }  
}
function appendCareVisitView(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Views/careVisit.html', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.querySelector('#viewContainer').innerHTML = this.responseText;
            callBackFunction();
        }
    }
    xhttp.send();
}
function appendSplashView() {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Views/splash.html', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.querySelector('#viewContainer').innerHTML = this.responseText;
        }
    }
    xhttp.send();
}