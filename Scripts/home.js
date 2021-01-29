function initHomeView() {    
    if (person !== undefined) {
        appendCareVisitView(initCareVisitView);
    } else {
        appendVisitorView(initVisitorView);
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