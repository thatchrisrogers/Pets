﻿let today = new Date();
let months = [{ value: 1, text: "January" }, { value: 2, text: "February" }, { value: 3, text: "March" }, { value: 4, text: "April" }, { value: 5, text: "May" }, { value: 6, text: "June" }, { value: 7, text: "July" }, { value: 8, text: "August" }, { value: 9, text: "September" }, { value: 10, text: "October" }, { value: 11, text: "November" }, { value: 12, text: "December" } ];
let selectMonth;
let selectYear;
let careRequests;
let careRequestForm;
let selectHouseholdName;

function initAvailabilityView() {
    let currentMonth = today.getMonth() + 1;
    let currentYear = today.getFullYear();
    selectMonth = document.getElementById("selectMonth");
    selectYear = document.getElementById("selectYear");

    let optionMonth;
    for (month of months) {
        optionMonth = document.createElement("option");
        optionMonth.value = month.value;
        optionMonth.text = month.text;
        selectMonth.appendChild(optionMonth);
    }
    selectMonth.value = currentMonth;

    let optionYear;
    for (let i = -1; i <= 1; i++) {
        optionYear = document.createElement("option");
        optionYear.text = currentYear + i;
        optionYear.value = currentYear + i;
        selectYear.appendChild(optionYear);
        optionYear = document.createElement("option");
    }
    selectYear.value = currentYear;
    getCareRequests(showCalendar);

    document.getElementById('CareRequestForm').onsubmit = function (event) {
        event.preventDefault();       
        saveCareRequest();
        if (document.activeElement.id === 'Save') {
            // displayCustomerForm(careRequest);  //If staying on the form, then refresh with fresh IDs passed back in the response.
        }
        else if (document.activeElement.id === 'SaveAndClose') {
            closeCareRequestForm();
        }
    };
}
function changeMonthYear() {
    getCareRequests(showCalendar);
}
function changeMonth(gotoMonth) {
    let selectedMonth = parseInt(selectMonth.value);
    let selectedYear = parseInt(selectYear.value);
    if (gotoMonth === 1) {
        gotoMonth = (selectedMonth === 12) ? 1 : selectedMonth + 1;
        gotoYear = (selectedMonth === 12) ? selectedYear + 1 : selectedYear;
    } else if (gotoMonth === -1) {
        gotoMonth = (selectedMonth === 1) ? 12 : selectedMonth - 1;
        gotoYear = (selectedMonth === 1) ? selectedYear - 1 : selectedYear;
    }
    selectMonth.value = gotoMonth;
    selectYear.value = gotoYear;
    changeMonthYear();
}
function showCalendar() {
    let month = parseInt(selectMonth.value - 1);
    let year = parseInt(selectYear.value);

    let firstDayOfMonth = (new Date(year, month)).getDay();

    calendarBody = document.getElementById("calendarBody");
    calendarBody.innerHTML = "";   // clearing all previous cells

    // creating all cells
    let dayOfMonth = 1;
    let daysInMonth = 32 - new Date(year, month, 32).getDate();
    let startDay;
    let endDay;
    let cell;
    let pHouseholdName, hiddenCareRequestId;
    let cellHeading;

    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");
        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDayOfMonth) {
                cell = document.createElement("td");
                row.appendChild(cell);
            }
            else if (dayOfMonth > daysInMonth) {
                break;
            }
            else {
                cell = document.createElement("td");
                
                cellHeading = document.createElement("h3");
                cellHeading.classList.add('calendarDay');
                cellHeading.innerHTML = dayOfMonth;
                cellHeading.onclick = function () {
                    try {
                        displayCareRequestForm(this.innerHTML, undefined);
                    }
                    catch (e) {
                        displayError('Error displaying Care Request - ' + e.message);
                    }
                }
                cell.appendChild(cellHeading);

                if (dayOfMonth === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.classList.add("selected");
                } 
                for (careRequest of careRequests) {
                    startDay = new Date(careRequest.StartDate).getDate();
                    endDay = new Date(careRequest.EndDate).getDate();
                    if (dayOfMonth >= startDay && dayOfMonth <= endDay) {
                        pHouseholdName = document.createElement('p');
                        pHouseholdName.classList.add('calendarEntry');
                        pHouseholdName.innerHTML = careRequest.HouseholdName;
                        hiddenCareRequestId = document.createElement('input');
                        hiddenCareRequestId.type = 'hidden';
                        hiddenCareRequestId.name = 'CareRequestId';
                        hiddenCareRequestId.value = careRequest.ID;
                        pHouseholdName.appendChild(hiddenCareRequestId);
                        pHouseholdName.onclick = function () {
                            displayCareRequestForm(undefined, loadCareRequest(this.querySelector("input[name='CareRequestId']").value));
                        }
                        cell.appendChild(pHouseholdName);
                    }
                }
                
                row.appendChild(cell);
                dayOfMonth++;
            }
        }
        calendarBody.appendChild(row); // appending each row into calendar body.
    }
}
function displayCareRequestForm(selectedDay, callBackFunction) {
    careRequestForm = document.forms.namedItem('CareRequestForm');
    selectHouseholdName = document.getElementById('HouseholdName');

    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/customer', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status === 200) {
            customers = JSON.parse(this.responseText);
            let option;
            for (customer of customers) {
                option = document.createElement("option");
                option.value = customer.ID;
                option.text = customer.HouseholdName;
                selectHouseholdName.appendChild(option);
            }
            if (callBackFunction !== undefined) {
                callBackFunction();
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Household Names - onerror event');
    };
    if (selectedDay !== undefined) {
        let selectedDate = new Date(selectYear.value, parseInt(selectMonth.value) - 1, selectedDay);
        document.getElementById('StartDate').value = selectedDate.toISOString().slice(0, 11) + '08:00'; //2020-11-01T15:41:28.027Z
        document.getElementById('EndDate').value = selectedDate.addDays(1).toISOString().slice(0, 11) + '17:00';  
    }

    careRequestForm.style.display = 'block';
}
function loadCareRequest(careRequestID) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careRequest/' + careRequestID, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                let careRequest = JSON.parse(this.responseText);
                selectHouseholdName.value = careRequest.CustomerID;
                document.getElementById('StartDate').value = careRequest.StartDate;
                document.getElementById('EndDate').value = careRequest.EndDate;
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
function closeCareRequestForm() {
    document.getElementById("CareRequestForm").style.display = 'none';
}
function saveCareRequest() {
    let formData = document.getElementById('CareRequestForm');
    let careRequest = {};
    //careRequest.ID = careRequest;
    careRequest.CustomerID = formData.HouseholdName.value;
    careRequest.StartDate = formData.StartDate.value;
    careRequest.EndDate = formData.EndDate.value;
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/careRequest", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                displaySuccess('Care Request saved');
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

