let careVisitDate;
let careVisitTableBody;
let careRequest = {};
let careRequests = [];
let careVisit = {};
let careVisits = [];
let careVisitTask = {};
let careVisitTasks = [];

function initCareRequestView(id) {
    loadSelectElement(document.getElementById('Customer'), customerListItems);
    getCareRequest(id, loadCareRequest); 
} 
function loadCareRequest() {
    careRequestForm = document.forms.namedItem("CareRequestForm");
    careRequestForm.CareRequestID.value = careRequest.ID;
    careRequestForm.Customer.value = careRequest.Customer.ID;
    careRequestForm.StartDate.value = careRequest.StartDate;
    careVisitDate = new Date(careRequest.StartDate);
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
        checkBox.onclick = function () { initCareVisitTasks(this.value, loadCareVisitTable); }
            label = document.createElement('label');
            label.innerHTML = pet.Name;
            label.htmlFor = checkBox.id;
            divPets.appendChild(checkBox);
            divPets.appendChild(label);
    }
    //loadCareVisitTable();
}
function initCareVisitTasks(petID, callBackFunction) {
    careVisits = [];
    //This function is used to prime the CareVisitTable with predefined PetTasks.  Once primed, the Tasks cane be edited to become the CareVisitTasks.  Basically, PetTasks are a template for CareVisitTasks
    //Step 1 - For each date between Start and End date.
    let pet = careRequest.Customer.Pets.find(item => item.id = petID);
    let tasks = pet.Tasks.sort(function (a, b) {
        return (a['PreferredTime'] > b['PreferredTime']) ? 1 : ((a['PreferredTime'] < b['PreferredTime']) ? -1 : 0);
    });
    let uniquePreferredTimes = [];
    for (task of tasks) {
        if (uniquePreferredTimes.includes(task.PreferredTime) === false) {
            uniquePreferredTimes.push(task.PreferredTime);
        }
    }
    do {
        //Create a careVisit object for each date + preferredTime (VistDate) combo   
        for (uniquePreferredTime of uniquePreferredTimes) {
            careVisitDate.setHours(uniquePreferredTime.split(':')[0]);
            careVisitDate.setMinutes(uniquePreferredTime.split(':')[1]);
            careVisit = { CareRequestID: careRequest.ID, VisitDate: new Date(careVisitDate), CareProviderID: 1 };
            careVisit.Tasks = tasks.filter(item => item.PreferredTime.substring(0, 5) === uniquePreferredTime.substring(0, 5));
            careVisits.push(careVisit);
        }
        careVisitDate.setDate(careVisitDate.getDate() + 1);
    } while (careVisitDate <= new Date(careRequest.EndDate));
    callBackFunction();
}
function loadCareVisitTable() {
    careVisitTableBody = document.getElementById("CareVisitTable").getElementsByTagName('tbody')[0];
    for (visit of careVisits) {
        addCareVisitRow(visit);
    }
}
function addCareVisitRow(visit) {
    let visitTableRow = careVisitTableBody.insertRow(-1);
    visitTableRow.className = 'careVisitRow';
    let cellIndex = 0; 
    visitTableRow.insertCell(cellIndex);
    addElementToTableRow('VisitID', 'input', 'hidden', undefined, false, undefined, (visit !== undefined ? visit.ID : undefined), cellIndex, visitTableRow);
    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('VisitDate', 'input', 'datetime-local', 'userInput', true, undefined, (visit !== undefined ? visit.VisitDate.toISOLocaleString() : undefined), cellIndex, visitTableRow).oninput = function () { visitTableRowChanged(visitTableRow); }
    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('CareProvider', 'select', undefined, 'userInput', true, careProviderListItems, (visit !== undefined ? visit.CareProviderID : undefined), cellIndex, visitTableRow).oninput = function () { visitTableRowChanged(visitTableRow); }

}
function addCareVisitTaskRow(visit) {
    let visitTableRow = careVisitTableBody.insertRow(-1);
    visitTableRow.className = 'careVisitTaskRow';
    let cellIndex = 0; 
    visitTableRow.insertCell(cellIndex);
    addElementToTableRow('TaskID', 'input', 'hidden', undefined, false, undefined, (visit !== undefined ? visit.ID : undefined), cellIndex, visitTableRow);
    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('CareNeeded', 'input', 'text', 'userInput', true, undefined, (visit !== undefined ? visit.Task.Description : undefined), cellIndex, visitTableRow).oninput = function () { visitTableRowChanged(visitTableRow); }
    return visitTableRow;
}
function visitTableRowChanged(visitTableRow) {
    tableRowChanged(visitTableRow, addCareVisitTaskRow);
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
function getCareRequest(careRequestID, callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careRequest/' + careRequestID, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                careRequest = JSON.parse(this.responseText);
                callBackFunction();
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