let careVisitView;
let careVisitForm;
let careVisit = {};
let careVisits = [];
let taskTable;
let taskTableBody;

function initCareVisitView() {
    getCareVisits(createCareVisitTable);
    document.getElementById('CareVisitForm').onsubmit = function (event) {
        event.preventDefault();
        completeCareVisit();
    };
}
function createCareVisitTable() {
    let careVisitMessage = document.getElementById("CareVisitMessage");
    let careVisitTable = document.getElementById("CareVisitTable");
    careVisitTable.removeChild(careVisitTable.getElementsByTagName('tbody')[0]); //remove tbody first to delete any rows (emptycareVisitTable)
    careVisitTableBody = careVisitTable.appendChild(document.createElement('tbody'));
    let careVisitTableRow;
    let tableCell;
    let element;
    if (careVisits.length > 0) {
        careVisitMessage.innerHTML = 'Whats Next:';
        careVisitTable.style.display = 'block';
        for (careVisit of careVisits) {
            careVisitTableRow = careVisitTableBody.insertRow(-1);
            tableCell = careVisitTableRow.insertCell(0);
            element = document.createElement('input');
            element.type = 'hidden';
            element.name = 'CareVisitID';
            element.value = careVisit.ID;
            tableCell.appendChild(element);
            element = document.createElement('label');
            element.innerHTML = careVisit.VisitDateTime.toDisplayDateTime();
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
    } else {
        careVisitMessage.innerHTML = 'You currently do not have any, scheduled Visits.';
        careVisitTable.style.display = 'none';
    }
}
function displayCareVisitForm() {
    try {
        careVisitForm = document.forms.namedItem("CareVisitForm");
        careVisitForm.querySelector("[id=VisitDateTime]").innerHTML = careVisit.VisitDateTime.toDisplayDateTime();
        careVisitForm.querySelector("[id=CustomerName]").innerHTML = careVisit.Customer.Name;
        careVisitForm.querySelector("[id=Address]").innerHTML = careVisit.Customer.Address;      
        careVisitForm.style.display = 'block';
        taskTable = document.getElementById("TaskTable");
        taskTable.removeChild(taskTable.getElementsByTagName('tbody')[0]); //remove tbody first to delete any rows (emptycareVisitTable)
        taskTableBody = taskTable.appendChild(document.createElement('tbody'));
        let taskTableRow;
        let tableCell;
        let element;
        for (task of careVisit.Tasks) {
            taskTableRow = taskTableBody.insertRow(-1);
            tableCell = taskTableRow.insertCell(0);
            element = document.createElement('input');
            element.type = 'hidden';
            element.name = 'CareVisitTaskID';
            element.value = task.ID;
            tableCell.appendChild(element);
            element = document.createElement('input');
            element.type = 'checkbox';
            element.name = 'IsComplete';
            element.checked = task.IsComplete;
            element.onchange = function () { saveCareVisitTask(this); }
            tableCell.appendChild(element);
            tableCell = taskTableRow.insertCell(1);
            element = document.createElement('label');
            element.innerHTML = task.Pet.Name;
            tableCell.appendChild(element);
            tableCell = taskTableRow.insertCell(2);
            element = document.createElement('label');
            element.innerHTML = task.Description;
            tableCell.appendChild(element);

        }
        displayEmailButton();
    }
    catch (e) {
        displayError('Error displaying Care Visit - ' + e.message);
    }
}
function closeCareVisitForm() {
    careVisitForm.style.display = 'none';
}
function getCareVisits(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careVisit?userName=' + person.UserName + '&isComplete=false', true);
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
                careVisit.VisitDateTime = new Date(careVisit.VisitDateTime).toLocaleDateTime(); //Convert from GMT string to Date object based on user's browser
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
function completeCareVisit(callBackFunction) {
    careVisit.IsComplete = true;
    careVisit.CompletedByPersonID = person.ID;
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/careVisit/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                displaySuccess('Care Visit saved');
                sendEmail();
                getCareVisits(createCareVisitTable);
                closeCareVisitForm();
            }
            else {
                displayError('Error saving Care Visit', this);
            }
        }
    };
    xhttp.send(JSON.stringify(careVisit));
    xhttp.onerror = function () {
        displayError('Error saving Care Visit - onerror event');
    };
}
function saveCareVisitTask(element) {
    let careVisitTask = {};
    taskTableRow = element.parentElement.parentElement;
    careVisitTask = careVisit.Tasks.find(item => item.ID === parseInt(taskTableRow.querySelector('[name=CareVisitTaskID]').value));
    careVisitTask.IsComplete = taskTableRow.querySelector('[name=IsComplete]').checked;
    careVisitTask.CompletedByPersonID = person.ID;
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/careVisitTask/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                displaySuccess('Care Visit Task saved'); 
                displayEmailButton();
            }
            else {
                displayError('Error saving Care Visit Task', this);
            }
        }
    };
    xhttp.send(JSON.stringify(careVisitTask));
    xhttp.onerror = function () {
        displayError('Error saving Care Visit Task - onerror event');
    };
}
function displayEmailButton() {
    if (document.querySelectorAll('input[name=IsComplete]:checked').length === document.querySelectorAll('input[name=IsComplete]').length) {
        document.getElementById('SendEmail').style.display = 'block';
    } else {
        document.getElementById('SendEmail').style.display = 'none';
    }
}
function sendEmail() {
    let emailBody = 'Hi, %0D%0A';  //https://www.w3schools.com/tags/ref_urlencode.ASP
    emailBody += 'I have completed the following task(s) for the visit scheduled for ' + careVisit.VisitDateTime.toDisplayDateTime() + ': %0D%0A';
    for (task of careVisit.Tasks) {
        emailBody += '%E2%80%A2  ' + task.Pet.Name + ' - ' + task.Description + '%0D%0A';
    }
    emailBody += 'Thanks! %0D%0A';
    emailBody += careVisit.CareProvider.Name;


    window.open('mailTo:' + careVisit.Customer.Email + '?cc=thatchrisrogers@gmail.com' + '&subject=Care Visit Complete' + '&body=' + emailBody);
}
