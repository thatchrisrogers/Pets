let guessNextVisitDate;
let visitTableBody;

function initCareRequestView(id) {
    loadSelectElement(document.getElementById('Customer'), customerListItems);
    getCareRequest(id); 
} 
function loadCareRequest(careRequest) {
    careRequestForm = document.forms.namedItem("CareRequestForm");
    careRequestForm.CareRequestID.value = careRequest.ID;
    careRequestForm.Customer.value = careRequest.Customer.ID;
    careRequestForm.StartDate.value = careRequest.StartDate;
    guessNextVisitDate = new Date(careRequest.StartDate);
    careRequestForm.EndDate.value = careRequest.EndDate;
    //loadSelectElement(document.getElementById('Pets'), careRequest.Customer.Pets);
    let divPets = document.getElementById('divPets');
    let checkBox;
    let label;
    for (pet of careRequest.Customer.Pets) {
        checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.id = 'cb' + pet.ID;
        checkBox.value = pet.ID;
        checkBox.onclick = function() {
            alert(this.value);
        }
        label = document.createElement('label');
        label.innerHTML = pet.Name;
        label.htmlFor = checkBox.id;
        divPets.appendChild(checkBox);
        divPets.appendChild(label);
    }


    //visitTableBody = document.getElementById("VisitTable").getElementsByTagName('tbody')[0];
    //visitTableBody.innerHTML = '';  //delete all cells
    //for (visit of careRequest.Visits) {
    //    addVisitTableRow(visitTableBody, visit);
    //}

    //if (visit.careRequest.Visits === null)
    //do {
    //    initVisitTableRows();
    //}
    //while (guessNextVisitDate <= new Date(careRequest.EndDate));
    

    //addVisitTableRow(undefined);
}
function addVisitTableRow(visit) {
    let visitTableRow = visitTableBody.insertRow(-1);
    let cellIndex = 0; 
    visitTableRow.insertCell(cellIndex);
    addElementToTableRow('VisitID', 'input', 'hidden', undefined, false, undefined, (visit !== undefined ? visit.ID : undefined), cellIndex, visitTableRow);
    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('VisitDate', 'input', 'datetime-local', 'userInput', true, undefined, (visit !== undefined ? visit.VisitDate : undefined), cellIndex, visitTableRow).oninput = function () { visitTableRowChanged(visitTableRow); }
    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('CareProvider', 'select', undefined, 'userInput', true, careProviderListItems, (visit !== undefined ? visit.CareProviderID : undefined), cellIndex, visitTableRow).oninput = function () { visitTableRowChanged(visitTableRow); }
    return visitTableRow;
}
function visitTableRowChanged(visitTableRow) {
    tableRowChanged(visitTableRow, addVisitTableRow);
}
function initVisitTableRows() { 
    let visitTableRow = addVisitTableRow(undefined);
    addDeleteButton(visitTableRow);
    visitTableRow.querySelector('[name=VisitDate]').value = guessNextVisitDate.toISOLocaleString();
    visitTableRow.querySelector('[name=CareProvider]').value = 1;
    if (guessNextVisitDate.getHours() <= 10) {
        guessNextVisitDate.setHours(guessNextVisitDate.getHours() + 9);
    } else if (guessNextVisitDate.getHours() > 10 && guessNextVisitDate.getHours() <= 17) {
        guessNextVisitDate.setHours(guessNextVisitDate.getHours() + 5);
    }
    else {
        guessNextVisitDate.setHours(guessNextVisitDate.getHours() + 10);
    }
}

function getCareRequests(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careRequest?month=' + selectMonth.value + '&' + 'year=' + selectYear.value, true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                careRequests = JSON.parse(this.responseText);
                callBackFunction();
            }
            else {
                displayError('Error getting Care Requests', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Care Requests - onerror event');
    };
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

