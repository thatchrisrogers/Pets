let today = new Date();
let months = [{ value: 1, text: "January" }, { value: 2, text: "February" }, { value: 3, text: "March" }, { value: 4, text: "April" }, { value: 5, text: "May" }, { value: 6, text: "June" }, { value: 7, text: "July" }, { value: 8, text: "August" }, { value: 9, text: "September" }, { value: 10, text: "October" }, { value: 11, text: "November" }, { value: 12, text: "December" } ];
let selectMonth;
let selectYear;

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
    showCalendar(currentMonth, currentYear);

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
function showCalendar(month, year) {
    let firstDayOfMonth = (new Date(year, month - 1)).getDay();

    calendarBody = document.getElementById("calendarBody");
    calendarBody.innerHTML = "";   // clearing all previous cells

    // creating all cells
    let dayOfMonth = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");
        let cell;
        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDayOfMonth) {
                cell = document.createElement("td");
                //cellText = document.createTextNode("");
                //cell.appendChild(cellText);
                row.appendChild(cell);
            }
            else if (dayOfMonth > daysInMonth(month, year)) {
                break;
            }
            else {
                cell = document.createElement("td");
                cell.innerHTML = dayOfMonth;
                if (dayOfMonth === today.getDate() && year === today.getFullYear() && month === parseInt(today.getMonth()) + 1) {
                    cell.classList.add("selected");
                } 
                cell.onclick = function () {
                    try {
                        displayCareRequest(this.innerHTML);
                    }
                    catch (e) {
                        displayError('Error displaying Care Request - ' + e.message);
                    }
                }
                row.appendChild(cell);
                dayOfMonth++;
            }
        }
        calendarBody.appendChild(row); // appending each row into calendar body.
    }
}
function changeMonthYear() {
    showCalendar(document.getElementById("selectMonth").value, document.getElementById("selectYear").value);
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
function daysInMonth(month, year) {
    return 32 - new Date(year, month + 1, 32).getDate();
}
function displayCareRequest(selectedDay) {
    let careRequestForm = document.forms.namedItem("CareRequestForm");
    let selectHouseholdName = document.getElementById("HouseholdName");
    let selectedDate = new Date(selectYear.value, parseInt(selectMonth.value) - 1, selectedDay);
    document.getElementById("StartDate").value = selectedDate.toISOString().slice(0, 11) + '08:00'; //2020-11-01T15:41:28.027Z
    document.getElementById("EndDate").value = selectedDate.addDays(1).toISOString().slice(0, 11) + '17:00';

    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/customer', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                customers = JSON.parse(this.responseText);
                let option;
                for (customer of customers) {
                    option = document.createElement("option");
                    option.value = customer.ID;
                    option.text = customer.HouseholdName;
                    selectHouseholdName.appendChild(option);
                }
            }
            else {
                displayError('Error getting Household Names', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Household Names - onerror event');
    };


    careRequestForm.style.display = 'block';
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
function getCareRequests(month, year) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careRequest', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                let careRequests = JSON.parse(this.responseText);
                
            }
            else {
                displayError('Error getting Care Requests', this);
            }
        }
    };
    xhttp.send(month, year);
    xhttp.onerror = function () {
        displayError('Error getting Care Requests - onerror event');
    };
}


