let todaysDate = new Date();  //ToDo - Adjust to browser timezone
let months = [{ value: 1, text: "January" }, { value: 2, text: "February" }, { value: 3, text: "March" }, { value: 4, text: "April" }, { value: 5, text: "May" }, { value: 6, text: "June" }, { value: 7, text: "July" }, { value: 8, text: "August" }, { value: 9, text: "September" }, { value: 10, text: "October" }, { value: 11, text: "November" }, { value: 12, text: "December" } ];
let selectMonth;
let selectYear;
let selectCustomer;

function initCareCalendarView() {
    let currentMonth = todaysDate.getMonth() + 1;
    let currentYear = todaysDate.getFullYear();
    selectMonth = document.getElementById("selectMonth");
    selectYear = document.getElementById("selectYear");

    let optionMonth;
    for (selectedMonth of months) {
        optionMonth = document.createElement("option");
        optionMonth.value = selectedMonth.value;
        optionMonth.text = selectedMonth.text;
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
    getCareRequests(loadCalendar);
}
function changeMonthYear() {
    getCareRequests(loadCalendar);
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
function loadCalendar() {
    let selectedMonth = parseInt(selectMonth.value - 1);
    let selectedYear = parseInt(selectYear.value);
    let firstDayOfMonth = (new Date(selectedYear, selectedMonth)).getDay();
    let calendarBody = document.getElementById("calendarBody");
    calendarBody.innerHTML = "";   // clearing all previous cells
    // creating all cells
    let dayOfMonth = 1;
    let daysInMonth = 32 - new Date(selectedYear, selectedMonth, 32).getDate();
    let cell;
    let requestStartDate;
    let requestEndDate;
    let iterativeDate;
    let pCustomerName, hiddenCareRequestId;
    let cellHeading;

    for (let rowNum = 0; rowNum < 6; rowNum++) {
        // creates a table row
        let row = document.createElement("tr");
        for (let cellNum = 0; cellNum < 7; cellNum++) {
            if (rowNum === 0 && cellNum < firstDayOfMonth) {
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
                        let startDate = new Date(selectYear.value, parseInt(selectMonth.value) - 1, this.innerHTML);
                        appendCareRequestForm(function () { displayCareRequestForm(undefined, startDate); })                                         
                    }
                    catch (e) {
                        displayError('Error displaying Care Calendar Request Form - ' + e.message);
                    }
                }
                cell.appendChild(cellHeading);
                iterativeDate = new Date(selectedYear, selectedMonth, dayOfMonth);
                if (iterativeDate === todaysDate) {
                    cell.classList.add("selected");
                }             
                for (careRequest of careRequests) {
                    requestStartDate = new Date(careRequest.StartDate);
                    requestEndDate = new Date(careRequest.EndDate);
                    if (iterativeDate >= requestStartDate && iterativeDate <= requestEndDate) {
                        pCustomerName = document.createElement('p');
                        pCustomerName.classList.add('calendarEntry');
                        pCustomerName.innerHTML = careRequest.Customer.Name;
                        hiddenCareRequestId = document.createElement('input');
                        hiddenCareRequestId.type = 'hidden';
                        hiddenCareRequestId.name = 'CareRequestId';
                        hiddenCareRequestId.value = careRequest.ID;
                        pCustomerName.appendChild(hiddenCareRequestId);
                        pCustomerName.onclick = function () {
                            let careRequestID = this.querySelector("input[name='CareRequestId']").value;
                            appendCareRequestForm(function () { displayCareRequestForm(careRequestID, undefined) });
                        }
                        cell.appendChild(pCustomerName);
                    }
                }                
                row.appendChild(cell);
                dayOfMonth++;
            }
        }
        calendarBody.appendChild(row); // appending each row into calendar body.
    }
}
function appendCareRequestForm(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Views/careRequest.html', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.querySelector('#formContainer').innerHTML = this.responseText;
            callBackFunction();
        }
    }
    xhttp.send();
    
}






