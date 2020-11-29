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
    careRequestForm.EndDate.value = careRequest.EndDate;
    //loadSelectElement(document.getElementById('Pets'), careRequest.Customer.Pets);
    let divPets = document.getElementById('divPets');
    let checkBox;
    let label;
    for (pet of careRequest.Customer.Pets) {
        checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.name = 'petCheckboxes';
        checkBox.id = 'petCheckbox' + pet.ID;
        checkBox.value = pet.ID;
        checkBox.onclick = function () { initCareVisits(loadCareVisitTable); }
            label = document.createElement('label');
            label.innerHTML = pet.Name;
            label.htmlFor = checkBox.id;
            divPets.appendChild(checkBox);
            divPets.appendChild(label);
    }
}
function initCareVisits(callBackFunction) {
    careVisits = [];
    //This function is used to prime the CareVisitTable with predefined PetTasks.  Once primed, the Tasks can be edited to become the CareVisitTasks.  Basically, PetTasks are a template for CareVisitTasks
    //Step 1 - For each date between Start and End date.
    let pet = {};
    let petTasks = [];
    let petCheckboxes = document.getElementsByName('petCheckboxes');
    for (petCheckbox of petCheckboxes) {
        if (petCheckbox.checked) {
            pet = careRequest.Customer.Pets.find(item => item.ID === parseInt(petCheckbox.value));
            //petTasks.push.apply(petTasks, pet.Tasks);
            for (task of pet.Tasks) {
                petTasks.push({ PreferredTime: task.PreferredTime, Description: pet.Name + ' - ' + task.Description });
            }           
        }
    }

    petTasks = petTasks.sort(function (a, b) {
        return (a['PreferredTime'] > b['PreferredTime']) ? 1 : ((a['PreferredTime'] < b['PreferredTime']) ? -1 : 0);
    });
    let uniquePreferredTimes = [];
    for (petTask of petTasks) {
        if (uniquePreferredTimes.includes(petTask.PreferredTime) === false) {
            uniquePreferredTimes.push(petTask.PreferredTime);
        }
    }
    careVisitDate = new Date(careRequest.StartDate);
    do {
        //Create a careVisit object for each date + preferredTime (VistDate) combo   
        for (uniquePreferredTime of uniquePreferredTimes) {
            careVisitDate.setHours(uniquePreferredTime.split(':')[0]);
            careVisitDate.setMinutes(uniquePreferredTime.split(':')[1]);
            careVisit = { CareRequestID: careRequest.ID, VisitDate: new Date(careVisitDate), CareProviderID: 1 };
            careVisit.Tasks = petTasks.filter(item => item.PreferredTime.substring(0, 5) === uniquePreferredTime.substring(0, 5));
            careVisits.push(careVisit);
        }
        careVisitDate.setDate(careVisitDate.getDate() + 1);
    } while (careVisitDate <= new Date(careRequest.EndDate));
    callBackFunction();
}
function loadCareVisitTable() {
    let careVisitTable = document.getElementById("CareVisitTable");
    careVisitTable.className = 'parentTable';
    careVisitTable.removeChild(careVisitTable.getElementsByTagName('tbody')[0]);
    careVisitTableBody = careVisitTable.appendChild(document.createElement('tbody'));
    for (visit of careVisits) {
        addCareVisitRow(visit);
    }
}
function addCareVisitRow(visit) {
    let visitTableRow = careVisitTableBody.insertRow(-1);
    visitTableRow.className = 'parentRow';
    let cellIndex = 0; 
    visitTableRow.insertCell(cellIndex);
    addElementToTableRow('VisitID', 'input', 'hidden', undefined, false, undefined, (visit !== undefined ? visit.ID : undefined), cellIndex, visitTableRow);
    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('VisitDate', 'input', 'hidden', undefined, false, undefined, (visit !== undefined ? visit.VisitDate : undefined), cellIndex, visitTableRow);

    let weekdayLabel = document.createElement('label'); 
    weekdayLabel.innerHTML = visit.VisitDate.toWeekday() + ' ';
    visitTableRow.cells[cellIndex].appendChild(weekdayLabel);

    addElementToTableRow('VisitTime', 'input', 'time', 'userInput', true, undefined, (visit !== undefined ? visit.VisitDate.toISOLocaleString().split('T')[1]  : undefined), cellIndex, visitTableRow).oninput = function () { visitTableRowChanged(visitTableRow); }
    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('CareProvider', 'select', undefined, 'userInput', true, careProviderListItems, (visit !== undefined ? visit.CareProviderID : undefined), cellIndex, visitTableRow).oninput = function () { visitTableRowChanged(visitTableRow); }

    //Tasks
    let taskTableContainerRow = careVisitTableBody.insertRow(-1);
    taskTableContainerRow.className = 'childTableContainerRow';
    let taskTableContainerCell = taskTableContainerRow.insertCell(0);
    taskTableContainerCell.colSpan = 3;
    let taskTable = document.createElement('table');
    taskTable.className = 'childTable';
    let taskBody = document.createElement('tbody');
    for (task of visit.Tasks) {
        addCareVisitTaskRow(task, taskBody);
    }
    addCareVisitTaskRow(undefined, taskBody);
    taskTable.appendChild(taskBody);
    taskTableContainerCell.appendChild(taskTable);
}
function visitTableRowChanged(visitTableRow) {
    tableRowChanged(visitTableRow, addCareVisitTaskRow);
}
function addCareVisitTaskRow(task, taskBody) {
    let taskRow = taskBody.insertRow(-1);
    taskRow.className = 'childRow';
    let cellIndex = 0;
    taskRow.insertCell(cellIndex);
    addElementToTableRow('TaskID', 'input', 'hidden', undefined, false, undefined, (task !== undefined ? task.ID : undefined), cellIndex, taskRow);
    taskRow.insertCell(cellIndex += 1);
    addElementToTableRow('CareNeeded', 'input', 'text', 'userInput', true, undefined, (task !== undefined ? task.Description : undefined), cellIndex, taskRow).oninput = function () { taskTableRowChanged(taskRow); } 
    return taskRow;
}
function taskTableRowChanged(taskRow) {
    let taskBody = taskRow.parentElement;
    tableRowChanged(taskRow, function () { addCareVisitTaskRow(undefined, taskBody) });
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