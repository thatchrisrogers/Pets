let careVisitView;
let careVisit = {};
let careVisits = [];

function initCareVisitView() {
    getVisits(createCareVisitTable);
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
        element = document.createElement('label');
        element.innerHTML = careVisit.VisitDateTime;
        tableCell.appendChild(element);
        tableCell = careVisitTableRow.insertCell(1);
        element = document.createElement('label');
        element.innerHTML = careVisit.CustomerName;
        tableCell.appendChild(element);
        tableCell = careVisitTableRow.insertCell(2);
        element = document.createElement('label');
        element.innerHTML = careVisit.PetNames
        tableCell.appendChild(element);
        tableCell = careVisitTableRow.insertCell(3);
        element = document.createElement('label');
        element.innerHTML = careVisit.CareProviderName
        tableCell.appendChild(element);
        careVisitTableRow.onclick = function () {
            //careVisitID = this.cells[0].querySelector('[name=careVisitID]').value;
            //getcareVisit(careVisitID, displaycareVisitForm);
        }
    }
}
function getVisits(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careVisit', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                careVisits = JSON.parse(this.responseText);
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