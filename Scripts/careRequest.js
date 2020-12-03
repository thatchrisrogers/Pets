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
    let divPets = document.getElementById('divPets');
    let checkBox;
    let label;
    for (pet of careRequest.Customer.Pets) {
        checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.name = 'petCheckboxes';
        checkBox.id = 'petCheckbox' + pet.ID;
        checkBox.value = pet.ID;
        checkBox.onclick = function () { addRemovePetTasks(); }
        label = document.createElement('label');
        label.innerHTML = pet.Name;
        label.htmlFor = checkBox.id;
        divPets.appendChild(checkBox);
        divPets.appendChild(label);
    }
    if (careRequest.Visits === undefined) {
        initCareVisits(loadCareVisitTable);
    }
    else {
        loadCareVisitTable();
    }
}
function addRemovePetTasks() {
    //add code here to simply add/remove tasks specifically associated with a pet - do not rebuild all petTasks in case user has made changes
    //i need a PetID in the careVisit.Tasks list.  This means I also need it in the CareVisitTaskTable.  Make these changes first.  Also change CareNeeded to Description.  That was stupid idea.
}
function initCareVisits(callBackFunction) {
    careVisits = [];
    //This function is used to prime the CareVisitTable with predefined PetTasks.  Once primed, the Tasks can be edited to become the CareVisitTasks.  Basically, PetTasks are a template for CareVisitTasks
    let pet = {};
    let petTasks = [];
    let petCheckboxes = document.getElementsByName('petCheckboxes');
    for (petCheckbox of petCheckboxes) {
        petCheckbox.checked = true;
        pet = careRequest.Customer.Pets.find(item => item.ID === parseInt(petCheckbox.value));
        //petTasks.push.apply(petTasks, pet.Tasks);
        for (task of pet.Tasks) {
            petTasks.push({ PreferredTime: task.PreferredTime, PetID: pet.ID, Description: task.Description });
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
    let careVisitEndDate = new Date(careRequest.EndDate);
    careVisitEndDate.setHours(23);
    careVisitEndDate.setMinutes(59);
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
    } while (careVisitDate <= careVisitEndDate)
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
    addCareVisitRow(undefined);
}
function loadCareVisitTaskTable(visit, careVisitTableBody) {
    let taskTableContainerRow = careVisitTableBody.insertRow(-1);
    taskTableContainerRow.className = 'childTableContainerRow';
    let taskTableContainerCell = taskTableContainerRow.insertCell(0);
    taskTableContainerCell.colSpan = 3;
    let taskTable = document.createElement('table');
    taskTable.className = 'childTable';
    let taskBody = document.createElement('tbody');
    if (visit !== undefined) {
        for (task of visit.Tasks) {
            addCareVisitTaskRow(task, taskBody);
        }
        addCareVisitTaskRow(undefined, taskBody);
    }
    taskTable.appendChild(taskBody);
    taskTableContainerCell.appendChild(taskTable);
}
function addCareVisitRow(visit) {
    let visitTableRow = careVisitTableBody.insertRow(-1);
    visitTableRow.className = 'parentRow';
    let cellIndex = 0; 
    visitTableRow.insertCell(cellIndex);
    addElementToTableRow('VisitID', 'input', 'hidden', undefined, false, undefined, (visit !== undefined ? visit.ID : undefined), cellIndex, visitTableRow);
    visitTableRow.insertCell(cellIndex += 1);

    let weekdayLabel = document.createElement('label');
    weekdayLabel.name = 'VisitDayOfWeek';
    weekdayLabel.innerHTML = (visit !== undefined ? visit.VisitDate.toWeekday() + ', ' : ''); 
    visitTableRow.cells[cellIndex].appendChild(weekdayLabel);

    let visitDateElement = addElementToTableRow('VisitDate', 'input', 'datetime-local', 'userInput,hasDefaultValue', false, undefined, (visit !== undefined ? visit.VisitDate.toISOLocaleString() : undefined), cellIndex, visitTableRow);
    visitDateElement.oninput = function () {
            this.previousSibling.innerHTML = new Date(this.value).toWeekday() + ', ';
    }
    visitDateElement.onchange = function () {
        getCareVisitsFromPage(loadCareVisitTable);
    }

    visitTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('CareProvider', 'select', undefined, 'userInput', true, careProviderListItems, (visit !== undefined ? visit.CareProviderID : undefined), cellIndex, visitTableRow);

    //Tasks
    loadCareVisitTaskTable(visit, careVisitTableBody);
}
function addCareVisitTaskRow(task, taskBody) {
    let taskRow = taskBody.insertRow(-1);
    taskRow.className = 'childRow';
    let cellIndex = 0;
    taskRow.insertCell(cellIndex);
    addElementToTableRow('TaskID', 'input', 'hidden', undefined, false, undefined, (task !== undefined ? task.ID : undefined), cellIndex, taskRow);
    taskRow.insertCell(cellIndex += 1);
    addElementToTableRow('Pet', 'select', undefined, 'userInput', true, careRequest.Customer.Pets, (task !== undefined ? task.PetID : undefined), cellIndex, taskRow).oninput = function () { taskTableRowChanged(taskRow); } 
    taskRow.insertCell(cellIndex += 1);
    addElementToTableRow('TaskDescription', 'input', 'text', 'userInput', true, undefined, (task !== undefined ? task.Description : undefined), cellIndex, taskRow).oninput = function () { taskTableRowChanged(taskRow); } 
    return taskRow;
}
function taskTableRowChanged(taskRow) {
    let taskBody = taskRow.parentElement;
    tableRowChanged(taskRow, function () { addCareVisitTaskRow(undefined, taskBody) });
}
function getCareVisitsFromPage(callBackFunction) {
    careVisits = [];
    let careVisitTable = document.getElementById("CareVisitTable");
    for (parentRow of careVisitTable.getElementsByClassName('parentRow')) {

        careVisit = {};
        careVisit.ID = parentRow.querySelector('[name=VisitID]').value;
        careVisit.VisitDate = new Date(parentRow.querySelector('[name=VisitDate]').value);
        careVisit.CareProviderID = parentRow.querySelector('[name=CareProvider]').value;

        careVisitTasks = [];
        let childTableContainerRow = parentRow.nextSibling;
        if (childTableContainerRow.classList.contains('childTableContainerRow')) {
            for (childRow of childTableContainerRow.getElementsByClassName('childTable')[0].getElementsByClassName('childRow')) {
                if (childRow.querySelector('[name=TaskDescription]').value.trim() !== '') {
                    careVisitTask = {};
                    careVisitTask.ID = childRow.querySelector('[name=TaskID]').value;
                    careVisitTask.Description = childRow.querySelector('[name=TaskDescription]').value.trim();
                    careVisitTasks.push(careVisitTask);
                }                  
            }
        }
        careVisit.Tasks = careVisitTasks;
        careVisits.push(careVisit);
    }
    careVisits = careVisits.sort(function (a, b) {
        return (a['VisitDate'] > b['VisitDate']) ? 1 : ((a['VisitDate'] < b['VisitDate']) ? -1 : 0);
    });
    callBackFunction();
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