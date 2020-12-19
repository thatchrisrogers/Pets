﻿let careVisitDate;
let careVisitTableBody;
//let customer = {};
let careRequestForm;
let careRequest = {};
let careRequests = [];
let careVisit = {};
let careVisits = [];
let careVisitTask = {};
let careVisitTasks = [];

//I think you need to ask which Pets Need Care before showing the VisitTable.  After that, Show the VistsTable and hide the Pet CheckBoxList
//Build the following out for Lucy first.  Then decide how to handle a more simplifed form for the Customer where they specify the Stare and End Dates and Pets needing Care.
//The Pet needing Care at this levle is not in the model
function displayCareRequestForm(careRequestID, startDate) {
    careRequestForm = document.getElementById('CareRequestForm');
    careRequestForm.style.display = 'block';
    initCareRequestForm(careRequestID, startDate);
}
function initCareRequestForm(id, startDate) {
    careRequest = {};
    careRequests = [];
    careVisit = {};
    careVisits = [];
    careVisitTask = {};
    careVisitTasks = [];
    loadSelectElement(document.getElementById('Customer'), customerListItems);
    if (id === undefined) {
        if (startDate !== undefined) {
            document.getElementById('CareRequestID').value = undefined;
            careRequest = {};
            careRequest.ID = undefined;
            careRequest.StartDate = startDate;
            careRequest.EndDate = new Date(startDate.addDays(1));
            careRequest.EndDate.setHours(17, 0, 0, 0);
            document.getElementById('StartDate').value = careRequest.StartDate.toISOLocaleString(); 
            document.getElementById('EndDate').value = careRequest.EndDate.toISOLocaleString();
            //document.getElementById('StartDate').value = selectedDate.toISOString().slice(0, 11) + '08:00'; //2020-11-01T15:41:28.027Z
            //document.getElementById('EndDate').value = selectedDate.addDays(1).toISOString().slice(0, 11) + '17:00';
        }
    }
    else {
        getCareRequest(id, loadCareRequest);
    }
    document.getElementById('CareRequestForm').onsubmit = function (event) {
        event.preventDefault();
        saveCareRequest();
    };
} 
function closeCareRequestForm() {
    careRequestForm.style.display = 'none';
}
function careRequestCustomerChanged(customerID) {
    getCustomer(customerID, loadPets);  
}
function loadPets() {
    document.getElementById('petsLabel').style.display = 'block';
    let petsCheckboxContainer = document.getElementById('petsCheckboxContainer');
    let checkBox;
    let label;
    for (pet of customer.Pets) {
        checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.name = 'petCheckboxes';
        checkBox.id = 'petCheckbox' + pet.ID;
        checkBox.value = pet.ID;
        checkBox.onclick = function () {
            initCareVisits(loadCareVisitTable);
        }
        label = document.createElement('label');
        label.innerHTML = pet.Name;
        label.htmlFor = checkBox.id;
        petsCheckboxContainer.appendChild(checkBox);
        petsCheckboxContainer.appendChild(label);
    } 
}
function loadCareRequest() {
    careRequestForm.CareRequestID.value = careRequest.ID;
    careRequestForm.Customer.value = careRequest.Customer.ID;
    careRequestForm.StartDate.value = careRequest.StartDate;
    careRequestForm.EndDate.value = careRequest.EndDate;
    
    if (careRequest.Visits === undefined) {
        careVisits = [];
        initCareVisits(loadCareVisitTable);
    }
    else {
        customer = careRequest.Customer;
        careVisits = careRequest.Visits;
        loadCareVisitTable();
    }
}
function initCareVisits(callBackFunction) {
    //This function is used to prime the CareVisitTable with predefined PetTasks.  Once primed, the Tasks can be edited to become the CareVisitTasks.  Basically, PetTasks are a template for CareVisitTasks
    let pet = {};
    let petTasks = [];
    let petCheckboxes = document.getElementsByName('petCheckboxes');
    for (petCheckbox of petCheckboxes) {
        if (petCheckbox.checked) {
            pet = customer.Pets.find(item => item.ID === parseInt(petCheckbox.value));
            //petTasks.push.apply(petTasks, pet.Tasks);
            for (task of pet.Tasks) {
                petTasks.push({ PreferredTime: task.PreferredTime, PetID: pet.ID, Description: task.Description });
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
    let careVisitEndDate = new Date(careRequest.EndDate);
    careVisitEndDate.setHours(23);
    careVisitEndDate.setMinutes(59);
    do {
        //Create a careVisit object for each date + preferredTime (VisitDate) combo   
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
    careVisitTable.style.display = 'block';
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
    weekdayLabel.innerHTML = (visit !== undefined ? new Date(visit.VisitDate).toWeekday() + ', ' : ''); 
    visitTableRow.cells[cellIndex].appendChild(weekdayLabel);

    let visitDateElement = addElementToTableRow('VisitDate', 'input', 'datetime-local', 'userInput', true, undefined, (visit !== undefined ? new Date(visit.VisitDate).toISOLocaleString() : undefined), cellIndex, visitTableRow);
    visitDateElement.min = careRequest.StartDate;
    visitDateElement.max = careRequest.EndDate;
    //visitDateElement.step = 60;  //15 Mins. (1 minute = 60,000 milliseconds).
    visitDateElement.oninput = function () {
            this.previousSibling.innerHTML = new Date(this.value).toWeekday() + ', ';
    }
    visitDateElement.onchange = function () {
        let visitDateElementThatChanged = this;
        getCareVisitsFromPage(true,loadCareVisitTable);

        //find the row that was moved so the user can eassily find it after table reloads
        for (visitDateElement of document.querySelectorAll('[name=VisitDate]')) {
            if (visitDateElement.value === visitDateElementThatChanged.value) {
                let elementParentRow = visitDateElement.closest('.parentRow');
                let elementSiblingRow = elementParentRow.nextElementSibling;
                elementParentRow.classList.add('messageSuccess');
                elementSiblingRow.classList.add('messageSuccess');
                setTimeout(function () {
                    elementParentRow.classList.remove('messageSuccess');
                    elementSiblingRow.classList.remove('messageSuccess');
                }, 3000);
            }
        }
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
    addElementToTableRow('Pet', 'select', undefined, 'userInput', true, customer.Pets, (task !== undefined ? task.PetID : undefined), cellIndex, taskRow).oninput = function () { taskTableRowChanged(taskRow); } 
    taskRow.insertCell(cellIndex += 1);
    addElementToTableRow('TaskDescription', 'input', 'text', 'userInput', true, undefined, (task !== undefined ? task.Description : undefined), cellIndex, taskRow).oninput = function () { taskTableRowChanged(taskRow); } 
    return taskRow;
}
function taskTableRowChanged(taskRow) {
    let taskBody = taskRow.parentElement;
    tableRowChanged(taskRow, function () { addCareVisitTaskRow(undefined, taskBody) });
}
function getCareVisitsFromPage(includeIncompleteVisits, callBackFunction) {
    careVisits = [];
    let careVisitTable = document.getElementById("CareVisitTable");
    for (parentRow of careVisitTable.getElementsByClassName('parentRow')) {
        if (parentRow.querySelectorAll(".userInput[required]").length > 0 || includeIncompleteVisits) { //If row has required elements, then user has input values.  Let the required attribute handle data validation
            careVisit = {};
            careVisit.ID = parentRow.querySelector('[name=VisitID]').value;
            careVisit.VisitDate = parentRow.querySelector('[name=VisitDate]').value;
            careVisit.CareProviderID = parentRow.querySelector('[name=CareProvider]').value;

            careVisitTasks = [];
            let childTableContainerRow = parentRow.nextSibling;
            if (childTableContainerRow.classList.contains('childTableContainerRow')) {
                for (childRow of childTableContainerRow.getElementsByClassName('childTable')[0].getElementsByClassName('childRow')) {
                    if (childRow.querySelector('[name=TaskDescription]').value.trim() !== '') {
                        careVisitTask = {};
                        careVisitTask.ID = childRow.querySelector('[name=TaskID]').value;
                        careVisitTask.PetID = childRow.querySelector('[name=Pet]').value;
                        careVisitTask.Description = childRow.querySelector('[name=TaskDescription]').value.trim();
                        careVisitTasks.push(careVisitTask);
                    }
                }
            }
            careVisit.Tasks = careVisitTasks;
            careVisits.push(careVisit);
        }
    }
    careVisits = careVisits.sort(function (a, b) {
        return (a['VisitDate'] > b['VisitDate']) ? 1 : ((a['VisitDate'] < b['VisitDate']) ? -1 : 0);
    });
    if (callBackFunction !== undefined) {
        callBackFunction();
    } else {
        return careVisits;
    }
}
function saveCareRequest() {
    careRequest = {};
    careRequest.ID = careRequestForm.CareRequestID.value;
    careRequest.Customer = { ID: careRequestForm.Customer.value };
    careRequest.StartDate = careRequestForm.StartDate.value;
    careRequest.EndDate = careRequestForm.EndDate.value;
    careRequest.Visits = getCareVisitsFromPage(false, undefined);
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/careRequest", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                displaySuccess('Care Request saved');
                if (document.activeElement.id === 'Save') {
                    careRequest = JSON.parse(this.responseText);
                    loadCareRequest();
                }
                else if (document.activeElement.id === 'SaveAndClose') {
                    closeCareRequestForm();
                }
                getCareRequests(loadCalendar);
            }
            else {
                displayError('Error saving Care Request', this);
            }
        }
    };
    xhttp.send(JSON.stringify(careRequest));
    xhttp.onerror = function () {
        displayError('Error saving Care Request - onerror event');
    };
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