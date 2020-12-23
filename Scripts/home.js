﻿function initHomeView() {
    //If Lucy, then display upcoming Care Visits.  Build the If Lucy part later.
    let dateString = "2020-12-24T13:00:00";
    let date = new Date(dateString).toLocaleDateTime();
    alert(date);

    //appendCareVisitView(initCareVisitView);
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
