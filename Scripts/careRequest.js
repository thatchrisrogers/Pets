let guessNextVisitDate;
let visitTableBody;

function initCareRequestView() {
    loadSelectElement(document.getElementById('Customer'), customerListItems);
    getCareRequest(3); //  ToDo - This is hard coded for testing.  Fix!
} 
function getCareRequest(careRequestID) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careRequest/' + careRequestID, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                loadCareRequest(JSON.parse(this.responseText));
            }
            else {
                displayError('Error getting Care Request', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Care Request - onerror event');
    };
}
function loadCareRequest(careRequest) {
    let careRequestForm = document.forms.namedItem("CareRequestForm");
    careRequestForm.CareRequestID.value = careRequest.ID;
    careRequestForm.Customer.value = careRequest.CustomerID;
    careRequestForm.StartDate.value = careRequest.StartDate;
    guessNextVisitDate = new Date(careRequest.StartDate);
    careRequestForm.EndDate.value = careRequest.EndDate;

    visitTableBody = document.getElementById("VisitTable").getElementsByTagName('tbody')[0];
    visitTableBody.innerHTML = '';  //delete all cells
    //for (visit of careRequest.Visits) {
    //    addVisitTableRow(visitTableBody, visit);
    //}

    addVisitTableRow(undefined);
}
function addVisitTableRow(visit) {
    let visitTableRow = visitTableBody.insertRow(-1);
    let cellIndex = 0; 
    visitTableRow.insertCell(cellIndex);
    addElementToTableRow('VisitID', 'input', 'hidden', undefined, false, undefined, (visit !== undefined ? visit.ID : undefined), cellIndex, visitTableRow);
    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('VisitDate', 'input', 'datetime-local', 'userInput', true, undefined, (visit !== undefined ? visit.VisitDate : guessNextVisitDate.toISOLocaleString()), cellIndex, visitTableRow).oninput = function () { visitTableRowChanged(visitTableRow); }
    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('CareProvider', 'select', undefined, 'userInput', true, careProviderListItems, (visit !== undefined ? visit.CareProviderID : 1), cellIndex, visitTableRow).oninput = function () { visitTableRowChanged(visitTableRow); }
}
function visitTableRowChanged(visitTableRow) {
    guessNextVisitDate = new Date(visitTableRow.querySelector('[name=VisitDate]').value);
    guessNextVisitDate.setHours(guessNextVisitDate.getHours() + 8);
    tableRowChanged(visitTableRow, addVisitTableRow);
}