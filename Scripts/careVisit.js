let careVisitView;
let careVisitForm;
let careVisit = {};
let careVisits = [];

function initCareVisitView() {
    getCareVisits(createCareVisitTable);
}
function createCareVisitTable() {
    let careVisitTable = document.getElementById("CareVisitTable");
    careVisitTable.removeChild(careVisitTable.getElementsByTagName('tbody')[0]); //remove tbody first to delete any rows (emptycareVisitTable)
    careVisitTableBody = careVisitTable.appendChild(document.createElement('tbody'));
    let careVisitTableRow;
    let tableCell;
    let element;
    for (careVisit of careVisits) {
        careVisitTableRow = careVisitTableBody.insertRow(-1);
        tableCell = careVisitTableRow.insertCell(0);
        element = document.createElement('input');
        element.type = 'hidden';
        element.name = 'CareVisitID';
        element.value = careVisit.ID;
        tableCell.appendChild(element);
        element = document.createElement('label');
        element.innerHTML = careVisit.VisitDateTime.toDisplayFormat();
        tableCell.appendChild(element);
        tableCell = careVisitTableRow.insertCell(1);
        element = document.createElement('label');
        element.innerHTML = careVisit.Customer.Name;
        tableCell.appendChild(element);
        tableCell = careVisitTableRow.insertCell(2);
        element = document.createElement('label');
        element.innerHTML = careVisit.PetNames;
        tableCell.appendChild(element);
        tableCell = careVisitTableRow.insertCell(3);
        element = document.createElement('label');
        element.innerHTML = careVisit.CareProvider.Name;
        tableCell.appendChild(element);
        careVisitTableRow.onclick = function () {
            careVisitID = this.cells[0].querySelector('[name=CareVisitID]').value;
            getCareVisit(careVisitID, displayCareVisitForm);
        }
    }
}
function displayCareVisitForm() {
    try {
        careVisitForm = document.forms.namedItem("CareVisitForm");
        let taskTable = document.getElementById("TaskTable");
        careVisitForm.querySelector("[id=CustomerName]").innerHTML = careVisit.Customer.Name;

        careVisitForm.style.display = 'block';
    }
    catch (e) {
        displayError('Error displaying Customer - ' + e.message);
    }
}
function closeCareVisitForm() {
    careVisitForm.style.display = 'none';
}
function getCareVisits(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careVisit', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                careVisits = JSON.parse(this.responseText);
                for (visit of careVisits) { //Convert from GMT string to Date object based on user's browser
                    visit.VisitDateTime = new Date(visit.VisitDateTime).toLocaleDateTime();
                }
                callBackFunction();
            }
            else {
                displayError('Error getting Care Visits', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Care Visits - onerror event');
    };
}
function getCareVisit(careVisitID, callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careVisit/' + careVisitID, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                careVisit = JSON.parse(this.responseText);
                careVisit.VisitDateTime = new Date(visit.VisitDateTime).toLocaleDateTime(); //Convert from GMT string to Date object based on user's browser
                callBackFunction();
            }
            else {
                displayError('Error getting Care Visits', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Care Visits - onerror event');
    };
}